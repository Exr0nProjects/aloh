// from https://www.toptal.com/javascript/language-server-protocol-tutorial

import vscode_langserver from 'vscode-languageserver';
const {
    createConnection,
    Diagnostic,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams,
    InitializeResult,
    TextDocuments,
    DiagnosticSeverity,
    TextDocumentSyncKind,
} = vscode_langserver;

import { TextDocument } from 'vscode-languageserver-textdocument';

//import { fileURLToPath } from 'url';
import { basename } from 'path'
import { appendFile } from 'fs/promises';

import dbman_init from './dbman.mjs';
import objman_init from './objman.mjs';

//var dbman = dbman_init(root_dir.replace('file://', ''), connection);
var dbman = dbman_init(null, null);
var objman = null;

const getBlacklisted = (text) => {
    const blacklist = [
        'foo',
        'bar',
        'baz',
    ]
    const regex = new RegExp(`\\b(${blacklist.join('|')})\\b`, 'gi')
    const results = []
    while ((matches = regex.exec(text)) && results.length < 100) {
        results.push({
            value: matches[0],
            index: matches.index,
        })
    }
    return results
}
const blacklistToDiagnostic = (textDocument) => ({ index, value }) => ({
    severity: DiagnosticSeverity.Warning,
    range: {
        start: textDocument.positionAt(index),
        end: textDocument.positionAt(index + value.length),
    },
    message: `${value} is blacklisted.`,
    source: 'Blacklister',
})
const getDiagnostics = (textDocument) =>
    getBlacklisted(textDocument.getText())
        .map(blacklistToDiagnostic(textDocument))




export const connection = createConnection();
const documents = new TextDocuments(TextDocument)

connection.onInitialize(async (client_init_params) => {
    let root_dir = client_init_params.workspaceFolders[0].uri;
    if (!root_dir.startsWith('file://')) throw Error('unknown workspace uri');
    dbman = (await dbman);
    objman = await objman_init;
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            completionProvider: {
                resolveProvider: true
            }
        },
    }
});

documents.onDidChangeContent(async change => {      // TODO: lots of race conditions here
    const most_recent_text = change.document.getText();
    const file_id = basename((new URL(change.document.uri)).pathname);   // TODO: remove .aloh extension?

    objman.parseObjects(most_recent_text)
        .then(objs => {
            for (let ent in objs[0]) {
                objs[0][ent] = { file_id: file_id, lines: objs[0][ent].lines }
            }
            dbman.setNoteObjects(file_id, objs);
        });
    connection.sendDiagnostics({
        uri: change.document.uri,
        diagnostics: [{
            severity: DiagnosticSeverity.Warning,
            range: {
                start: { line: 0, position: 0 },
                end: { line: 0, position: 1 },
            },
            message: `file_id is '${file_id}'`,
            source: 'feedback',
        }]
    })
})

connection.onDidChangeWatchedFiles(async change => {
    // Monitored files have change in VSCode
    //connection.console.log('We received an file change event');
    //connection.console.log(change);
});

connection.onCompletion(async textdocument_position => {
    //connection.console.log(textdocument_position);
    return (await dbman.getEntityList())
        .map(name => ({
            label: name,
            kind: CompletionItemKind.Text,
            data: name,
        })
    );   // TODO: whittle down the list a bit using textdocument_position
});

connection.onCompletionResolve(async (item) => {
    item.detail = await dbman.getAkasForEntity(item.data)
        .then(akas => ',aka: ' + akas.join(', '))
        .catch(err => err.toString());
    item.documentation = await dbman.getReferenceForEntity(item.data)
        .catch(err => err.toString());
    return item;
});

documents.listen(connection)
