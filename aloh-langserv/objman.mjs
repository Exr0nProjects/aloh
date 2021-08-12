'use strict';

const SOCKET_PORT = 62326;
//const SPACY_MODEL = 'en_core_web_trf';
const SPACY_MODEL = 'en_core_web_lg';
const ENTITY_NOTATION = /\[[^\[\]]+\]/g;    // bracketed strings
//const ALLOWLIST_NER_TYPES = [ 'FAC', 'GPE', 'PERSON', 'ORG', 'DATE', 'NORP', 'PRODUCT', 'EVENT', 'LOC', 'WORK_OF_ART' ]
const DENYLIST_NER_TYPES = [ 'ORDINAL', 'CARDINAL', 'LAW', 'QUANTITY' ]

import io from 'socket.io-client';

import { spawn } from 'child_process';
import { appendFile } from 'fs/promises';
import { dirname } from 'path';

import dbman_init from './dbman.mjs';   // TODO: race conditions galore from accessing the DB from multiple places
var dbman = null;

// set up socket stuff
launchSpacyServer();
const socket = io(`http://localhost:${SOCKET_PORT}`)
socket.on('disconnect', () => {
    launchSpacyServer();        // did the spacy server die
});
function launchSpacyServer() {
    // spaghet
    //spawn('python3', ['-m', 'pip', 'install', '-r', 'requirements.txt']);
    //spawn('python3', ['spacy_server.py', SOCKET_PORT, SPACY_MODEL]);
    //spawn('source', ['.venv/bin/active', '&&', 'python3', 'spacy_server.py', SOCKET_PORT, SPACY_MODEL], { cwd: dirname((new URL(import.meta.url)).pathname) });
    //spawn('source', ['.venv/bin/active', '&&', 'python3', 'spacy_server.py', SOCKET_PORT, SPACY_MODEL], { cwd: '/home/exr0n/projects/aloh/aloh-langserv/' });
}

async function parse_entities(text) {
    let ret = {  }; // elements are name: { source: "str", lines: [] }
    let entity_list = await dbman.getEntityList();  // TODO: could optimize this by maintaining a trie

    const register = (src, ent, idx) => {
        // TODO: also note the start/end positions for syntax highlighting
        if (!ret.hasOwnProperty(ent))
            ret[ent] = { source: src, lines: [] };
        ret[ent].lines.push(idx);
    }
    await Promise.all(
        Array.from(text.split('\n').entries(), ([idx, line]) => new Promise((resv, _rej) => {
            // check for square brackets
            const matched = line.match(ENTITY_NOTATION)
            if (matched !== null) for (const ent of matched)
                register('marked', ent.slice(1, -1), idx);
            line = line.replaceAll(ENTITY_NOTATION, '');
            // check for existing entities
            for (const ent of entity_list) {
                let og_len = line.length;
                line = line.replaceAll(ent, '');
                if (line.length < og_len) {
                    register('existing', ent, idx);
                }
            }
            // SpaCy NER TODO: not very useful
            socket.emit('parse_NER', line, (resp) => {
                const got = resp.filter(x => !DENYLIST_NER_TYPES.includes(x[1]));
                got.forEach(x => register('NER', x[0], idx));
                resv();
            });
            // TODO: important terms detection
        }))
    );
    return ret;
}

async function parse_tags(text) { return []; }
async function parse_relations(text) { return []; }

const api = {
    parseObjects: async (text) => {
        return Promise.all([ parse_entities(text), parse_tags(text), parse_relations(text) ]);
    }
}
export default (async () => {
    let socket_connect_timeout = setTimeout(() => { throw new Error('Socket server connection took too long to establish.') }, 10*1000);
    let p = dbman_init(null, null);
    dbman = (await Promise.all([p, new Promise((res, _rej) => {
        socket.on('connect', () => {
            clearTimeout(socket_connect_timeout);
            res();
        });
    })]))[0];
    return api;
})();
