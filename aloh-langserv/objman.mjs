'use strict';

const SOCKET_PORT = 62326;
//const SPACY_MODEL = 'en_core_web_trf';
const SPACY_MODEL = 'en_core_web_lg';
// TODO: replace the leading (\s|^) with https://www.regular-expressions.info/lookaround.html to allow [match] [match]
const RELATION_PATTERN  = /(\s|^)\.[\w\-]+\w\b/g        // period then \w + '-'
const ENTITY_PATTERN    = /(\s|^)\[[^\[\]]+\](\W|$)/g   // bracketed strings
const TAG_PATTERN       = /(\s|^):[\w\-\/]+\w\b/g       // colon then \w + '-'

//const ALLOWLIST_NER_TYPES = [ 'FAC', 'GPE', 'PERSON', 'ORG', 'DATE', 'NORP', 'PRODUCT', 'EVENT', 'LOC', 'WORK_OF_ART' ]
const DENYLIST_NER_TYPES = [ 'ORDINAL', 'CARDINAL', 'LAW', 'QUANTITY' ]

import io from 'socket.io-client';

import { spawn } from 'child_process';
import { dirname } from 'path';

import dbman_init from './dbman.mjs';   // TODO: race conditions galore from accessing the DB from multiple places
import { hasOwn, file_log } from './util.mjs'

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
    // check for square brackets
    let ret = parse_with_regex(text, ENTITY_PATTERN,
        x => x[0] === '[' ? 1 : 2,
        x => x[x.length-1] == ']' ? 1 : 2
    )
    text = text.replaceAll(ENTITY_PATTERN,      match => ' '.repeat(match.length));
    text = text.replaceAll(TAG_PATTERN,         match => ' '.repeat(match.length));
    text = text.replaceAll(RELATION_PATTERN,    match => ' '.repeat(match.length));

    const register = (val, line, start, end) => {
        if (!hasOwn(ret, val)) ret[val] = { refs: [] }
        ret[val].refs.push({ line: line, start: start, end: end })
        file_log(`${val} now has ${ret[val].refs.length} references in this file`)
    }

    const entity_list = await dbman.getEntityNames();

    for (let [idx, line] of Array.from(text.split('\n').entries())) {
        // check for existing entities
        // TODO: sort and search by longest first
        // TODO: could optimize this by maintaining a trie
        file_log(`eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`)
        for (const ent of entity_list) {
            file_log(`testing '${line}' for ${ent} ${line.indexOf(ent)}`)
            for (let pos = line.indexOf(ent); pos >= 0; pos = line.indexOf(ent, pos+1)) {
        //        file_log(`at line ${idx} pos ${ent}`)
                register(ent, idx, pos, pos+ent.length);
            }
        //    line = line.replace(ent, match => ' '.repeat(match.length));
        }
    }

    file_log(`returning entities ${JSON.stringify(ret, null, 2)}`)

    //// TODO: this await is bork
    //await Promise.all(
    //    Array.from(text.split('\n').entries(), ([idx, line]) => new Promise((resv, _rej) => {
    //        //// SpaCy NER TODO: not very useful
    //        //socket.emit('parse_NER', line, (resp) => {
    //        //    const got = resp.filter(x => !DENYLIST_NER_TYPES.includes(x[1]));
    //        //    got.forEach(x => register(x[0], idx, x[2], x[3]));
    //        //    resv();
    //        //});
    //        // TODO: important terms detection
    //    }))
    //);
    return ret;
}

async function parse_with_regex(text, pattern, ignore_beg, ignore_end) {
    let ret = {};
    const register = (val, line, start, end) => {
        if (!hasOwn(ret, val)) ret[val] = { refs: [] }
        ret[val].refs.push({ line: line, start: start, end: end })
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
