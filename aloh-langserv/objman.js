'use strict';

const SOCKET_PORT = 62326;

const dbman = require('./dbman');   // TODO: race conditions galore from accessing the DB from multiple places

function parse_entities(text) {
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

function parse_tags(text) { return []; }
function parse_relations(text) { return []; }

module.exports = {
    parseObjects: async (text) => {
        return [ parse_entities(text), parse_tags(text), parse_relations(text) ];
    }
}

