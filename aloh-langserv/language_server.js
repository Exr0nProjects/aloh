// from https://www.toptal.com/javascript/language-server-protocol-tutorial

const {
    createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
} = require('vscode-languageserver')

const { TextDocument } = require('vscode-languageserver-textdocument')

const dbman = require('./dbman');

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

connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
        completionProvider: {
            resolveProvider: true
        }
    },
}));

documents.onDidChangeContent(change => {
    connection.sendDiagnostics({
        uri: change.document.uri,
        diagnostics: getDiagnostics(change.document),
    })
})

connection.onDidChangeWatchedFiles(change => {
    // Monitored files have change in VSCode
    connection.console.log('We received an file change event');
    connection.console.log(change);
});

connection.onCompletion(textdocument_position => {
    connection.console.log(textdocument_position);
    //dbman.hi(connection);
    let ret = [];
    for (let i=1; i<=10000; i++) {
        ret.push({
            label: `amazing${i}`,
            kind: CompletionItemKind.Text,
            data: i,
        });
    }
    return ret;
});

connection.onCompletionResolve((item) => {
    item.detail = 'item details';
    item.documentation = 'documentation stuff woooooo';
    return item;
});

documents.listen(connection)
//connection.listen()

