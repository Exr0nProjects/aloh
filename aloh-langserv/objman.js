'use strict';

const SOCKET_PORT = 62326;
//const SPACY_MODEL = 'en_core_web_trf';
const SPACY_MODEL = 'en_core_web_lg';
const ENTITY_NOTATION = /\[[^\[\]]+\]/g;    // bracketed strings
//const ALLOWLIST_NER_TYPES = [ 'FAC', 'GPE', 'PERSON', 'ORG', 'DATE', 'NORP', 'PRODUCT', 'EVENT', 'LOC', 'WORK_OF_ART' ]
const DENYLIST_NER_TYPES = [ 'ORDINAL', 'CARDINAL', 'LAW', 'QUANTITY' ]

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
    // spaghet
    //spawn('python3', ['-m', 'pip', 'install', '-r', 'requirements.txt']);
    spawn('python3', ['spacy_server.py', SOCKET_PORT, SPACY_MODEL]);
}

async function parse_entities(text) {
    let ret = {  }; // elements are name: { source: "str", lines: [] }
    let entity_list = await dbman.getEntityList();  // TODO: could optimize this by maintaining a trie

    const register = (src, ent, idx) => {
        if (!ret.hasOwnProperty(ent))
            ret[ent] = { source: src, lines: [] };
        ret[ent].lines.push(idx);
    }

    for (const [idx, line] of text.split('\n').entries()) {
        // check for square brackets
        for (const ent in line.match(ENTITY_NOTATION))
            register('marked', ent, idx);
        line = line.replaceAll(ENTITY_NOTATION, '');
        // check for existing entities
        for (const ent of entity_list) {
            let og_len = line.length;
            let line = line.replaceAll(ent, '');
            if (line.length < og_len) {
                register('existing', ent, idx);
            }
        }
        // SpaCy NER TODO: not very useful
        socket.emit('parse_NER', line, (res) => {
            res.filter(x => !DENYLIST_NER_TYPES.includes(x[1]))
                .forEach(x => register('NER', x, idx));
        });
        // TODO: important terms detection
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
    socket.on('connect', () => { res(api) });
    setTimeout(() => { rej(Error('Socket server connection took too long to establish.')) }, 5*1000);
});
