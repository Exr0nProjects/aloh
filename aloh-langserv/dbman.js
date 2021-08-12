// for now we will re-sweep the entire directory every time. then, move to re-sweeping on launch and finally an actual DB
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

class Entity {    // not a class because https://stackoverflow.com/a/28281845/10372825
    constructor(/*workspace,*/ name, akas=new Set(), mentions=new Map()) {
        //this.workspace = workspace; // TODO: should entities know their workspace
        this.name = name;
        this.akas = akas;
        this.mentions = mentions;   // of the form 'field': [linenr, linenr]
    }
    // methods
    async set_mentions_by_file(updates) {
        for (const [n, m] of Object.entries(updates))
            this.mentions.set(n, m);
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
        setNoteObjects: async (fileid, objects) => {
            const [ entities, tags, relations ] = objects;
            // TODO: do stuff with entities, tags, relations
        }
    })
};

