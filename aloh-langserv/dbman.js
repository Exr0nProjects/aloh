// amazing
'use strict';

const {
    Diagnostic,
    ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
} = require('vscode-languageserver');

//function lsp_log(text) {
//    //let msg = JSON.stringify({ "msg": text });
//    //console.log(`Content-Length: ${msg.length}\r\n\r\n${msg}`);
//}

const Entity = {    // not a class because https://stackoverflow.com/a/28281845/10372825
    name: null,
    workspace: '/default/path/to/workspace',
    akas: set(),
    mentions: {},   // of the form 'fileid': [linenr, linenr]
    // methods
    set_mentions_by_file = async (updates) => {
        mentions.assign(updates);
    }
}
module.exports = {
    init: (workspace, connection) => ({
        // TODO: all the functions here need to be plugged into the db
        getEntityList: async () => {
            let ret = [];
            for (let i=1; i<=10000; i++) {
                ret.push({
                    label: `amazing${i}`,
                    kind: CompletionItemKind.Text,
                    data: i,
                });
            }
            return ret;
        },
        getAkasForEntity: async (entity_name) => {
            if (entity_name < 100) return ['thing1', 'thing2'];
            else throw Error(`Entity ${entity_name} not found!`);
        },
        getReferenceForEntity: async (entity_name) => {
            if (entity_name < 100) return `- .likes/Coco\n- .likes/cado\n`
            else throw Error(`Entity ${entity_name} not found!`);
        },
    })
};

