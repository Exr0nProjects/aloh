// from https://www.toptal.com/javascript/language-server-protocol-tutorial

const {
    createConnection,
	TextDocuments,
	DiagnosticSeverity,
} = require('vscode-languageserver')

const { TextDocument } = require('vscode-languageserver-textdocument')

var dbman = require('./dbman');
var objman = require('./objman');




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




exports.connection = createConnection()
const connection = exports.connection;
const documents = new TextDocuments(TextDocument)

connection.onInitialize(async (client_init_params) => {
    let root_dir = client_init_params.workspaceFolders[0].uri;
    if (!root_dir.startsWith('file://')) throw Error('unknown workspace uri');
    dbman = dbman.init(root_dir.replace('file://', ''), connection);
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
    const most_recent_text = change.contentChanges[change.contentChanges.length-1];

    let [ entities, tags, relations ] = await Promise.all(
        objman.parse_entities(most_recent_text),    // these modify the DB state
        objman.parse_tags(most_recent_text),
        objman.parse_relations(most_recent_text)
    );

    //connection.sendDiagnostics({
    //    uri: change.document.uri,
    //    diagnostics: getDiagnostics(change.document),
    //})
})

connection.onDidChangeWatchedFiles(async change => {
    // Monitored files have change in VSCode
    connection.console.log('We received an file change event');
    connection.console.log(change);
});

connection.onCompletion(async textdocument_position => {
    connection.console.log(textdocument_position);
    return await dbman.listEntities();   // TODO: whittle down the list a bit using textdocument_position
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
