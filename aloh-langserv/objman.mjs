'use strict';

const SOCKET_PORT = 62326;
//const SPACY_MODEL = 'en_core_web_trf';
const SPACY_MODEL = 'en_core_web_lg';
const RELATION_PATTERN  = /(\s|^)\.[\w\-]+\w\b/g        // period then \w + '-'
const ENTITY_PATTERN    = /(\s|^)\[[^\[\]]+\](\W|$)/g   // bracketed strings
const TAG_PATTERN       = /(\s|^):[\w\-\/]+\w\b/g       // colon then \w + '-'

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
function launchSpacyServer() {  // TODO: whats a clean solution for this?
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
        // TODO: use parse_with_regex
        if (!ret.hasOwnProperty(ent))
            ret[ent] = { source: src, lines: [] };
        ret[ent].lines.push(idx);
    }
    await Promise.all(
        Array.from(text.split('\n').entries(), ([idx, line]) => new Promise((resv, _rej) => {
            // check for square brackets
            const matched = line.match(ENTITY_PATTERN)
            if (matched !== null) for (const ent of matched)
                register('marked', ent.slice(1, -1), idx);
            line = line.replaceAll(ENTITY_PATTERN, '');
            // check for existing entities
            // TODO: sort and search by longest first
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

async function parse_with_regex(text, pattern, ignore_beg, ignore_end) {
    let ret = {};
    const register = (val, line, start, end) => {
        if (!ret.hasOwnProperty(val)) 
            ret[val] = { refs: [] }
        ret[val].refs.push([{ line: line, start: start, end: end }])
    }
    for (let [idx, line] of text.split('\n').entries()) {
        for (const match of line.matchAll(pattern)) {
            let [ b, e ] = [ ignore_beg(match[0]), ignore_end(match[0]) ];
            register(match[0].slice(b, e > 0 ? -e : undefined), idx,
                match.index + b, match.index + match[0].length - e);
        }
    }
    return ret;
}

async function parse_tags(text) {
    // TODO: combine functions, add locational info to detect whether things are connected
    // TODO: parse the bullet tree with - and + syntax, count leading spaces and if theres a leading bulletchar
    return parse_with_regex(text, TAG_PATTERN,
        x => x[0] === ':' ? 1 : 2,
        x => x.match(/\w$/) !== null ? 0 : 1
    );
}
async function parse_relations(text) {
    return parse_with_regex(text, RELATION_PATTERN,
        x => x[0] === '.' ? 1 : 2,
        x => x.match(/\w$/) !== null ? 0 : 1
    );
}

const api = {
    parseObjects: async (text) => {
        return Promise.all([ parse_entities(text), parse_tags(text), parse_relations(text) ]);
    }
}
export default (async () => {
    let socket_connect_timeout = setTimeout(() => { throw new Error('Socket server connection took too long to establish.') }, 10*1000);
    let p = dbman_init();
    dbman = (await Promise.all([p, new Promise((res, _rej) => {
        socket.on('connect', () => {
            clearTimeout(socket_connect_timeout);
            res();
        });
    })]))[0];
    return api;
})();
