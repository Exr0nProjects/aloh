'use strict';

const SOCKET_PORT = 62326;
//const SPACY_MODEL = 'en_core_web_trf';
const SPACY_MODEL = 'en_core_web_lg';

const { spawn } = require('child_process');
const io = require('socket.io-client');

const dbman = require('./dbman');   // TODO: race conditions galore from accessing the DB from multiple places

// set up socket stuff
launchSpacyServer();
const socket = io(`http://localhost:${SOCKET_PORT}`)
socket.on('disconnect', () => {
    launchSpacyServer();        // did the spacy server die
});
function launchSpacyServer() {
    spawn('python3', ['-m', 'pip', 'install', '-r', 'requirements.txt']);
    spawn('python3', ['spacy_server.py', SOCKET_PORT, SPACY_MODEL]);
}

async function parse_entities(text) {
    let ret = {  }; // elements are name: { source: "str", lines: [] }
    let entity_list = await dbman.getEntityList();  // TODO: could optimize this by maintaining a trie
    for (const [idx, line] of text.split('\n').entries()) {
        // check for existing entities
        const lower = line.toLower();
        for (const ent of entity_list) {
            if (lower.includes(ent.toLower())) {
                if (!ret.hasOwnProperty(ent))
                    ret[ent] = { source: 'existing', lines: [] };
                ret[ent].lines.push(idx);
            }
        }
    }
}

async function parse_tags(text) { return []; }
async function parse_relations(text) { return []; }

const api = {
    parseObjects: async (text) => {
        return Promise.all([ parse_entities(text), parse_tags(text), parse_relations(text) ]);
    }
}
module.exports = new Promise((res, rej) => {
    socket.on('connect', () => { console.log('connection successful!'); res(api) });
    setTimeout(() => { rej(Error('Socket server connection took too long to establish.')) }, 5*1000);
});
