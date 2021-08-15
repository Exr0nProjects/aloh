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

var dbman = dbman_init();
var objman = null;

const DB_INTERVAL = 1000;
var prev_db_timestamp = 0;

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

    if (Date.now() - prev_db_timestamp >= DB_INTERVAL) setTimeout(() => {
        prev_db_timestamp = Date.now();
        objman.parseObjects(most_recent_text)
            .then(objs => { dbman.setNoteObjects(file_id, objs) });
        //connection.sendDiagnostics({
        //    uri: change.document.uri,
        //    diagnostics: [{
        //        severity: DiagnosticSeverity.Hint,
        //        range: {
        //            start: { line: 0, position: 0 },
        //            end: { line: 0, position: 1 },
        //        },
        //        message: `Aloh is active here in '${file_id}'!`,
        //        source: 'hint',
        //    }]
        //})
    }, DB_INTERVAL);
});

connection.onDidChangeWatchedFiles(async change => {
    // Monitored files have change in VSCode
    //connection.console.log('We received an file change event');
    //connection.console.log(change);
});

connection.onCompletion(async textdocument_position => {
    //connection.console.log(textdocument_position);
    //return ['Huxley Marvit', 'Jacob Cole'].map(item => ({
    //    label: item,
    //    kind: CompletionItemKind.Text,
    //    data: 'ent',
    //}))

    return (await dbman.getEntityList())
        .map(item => ({
            label: item,
            kind: CompletionItemKind.Text,
            data: { type: 'ent' },
        })
    );   // TODO: whittle down the list a bit using textdocument_position
    //return (await dbman.getEntityList())
    //    .map(item => ({
    //        label: item.name,
    //        kind: CompletionItemKind.Text,
    //        data: { type: item.type },
    //    })
    //);   // TODO: whittle down the list a bit using textdocument_position
});

connection.onCompletionResolve(async (item) => {
    //item.detail = await dbman.getItemBlurb(item.data.type, item.name)
    //    .catch(err => err.toString());
    //item.documentation = await dbman.getItemDescription(item.data.type, item.data)
    //    .catch(err => err.toString());
    return item;
});

documents.listen(connection);
