// for now we will re-sweep the entire directory every time. then, move to re-sweeping on launch and finally an actual DB
'use strict';

import { appendFile } from 'fs/promises';

class Item {
    constructor(name, refs=new Map()) {
        //this.workspace = workspace; // TODO: should entities know their workspace
        this.name = name;
        this.refs = refs;   // of the form 'file': [{ line, start, end }...]
    }
    // methods
    async set_refs_by_file(file_id, refs) {
        if (refs.length === 0) {
            this.refs.delete(file_id);
            if (this.refs.size === 0) {
                db_entities.delete(this.name);
            }
        } else {
            this.refs.set(file_id, refs);
        }
    }
    toString() {
        return `<Item ${this.name}, ${JSON.stringify(Object.fromEntries(this.mentions), null, 4)}>`
    }
}
class Entity extends Item {
    constructor(name, refs=new Map(), akas=new Set()) {
        super(name, refs);
        this.akas = akas;
    }
    getBlurb() {
        return '.aka ' + [...this.akas].join(', ');
    }
    toString() {
        return `<Entity ${this.name}, ${JSON.stringify(Object.fromEntries(this.mentions), null, 4)}>`
    }
}
class Tag extends Item {
    getBlurb() {
        return `Referenced ${Array.from(this.refs.values(), v => v.length).reduce((a, b) => a + b, 0)} times.`
    }
}
class Rel extends Item {
    getBlurb() {
        return `Appears ${Array.from(this.refs.values(), v => v.length).reduce((a, b) => a + b, 0)} times.`
    }
}

var db_ents = new Map();
var db_tags = new Map();
var db_rels = new Map();
var databases = {
    'ents': db_ents,
    'tags': db_tags,
    'rels': db_rels,
}
function load_entities() {
    // TODO
}

function file_log(text) {
    appendFile('/home/exr0n/snap/dbman.log', text + '\n');
}

export default async function(/* NOTE: should this take workspace as an arg */) {
    load_entities();
    return {
        getEntityList: async () => {
            // TODO: add some metadata, eg. time or usage
            appendFile('/home/exr0n/snap/dbman.log', 'getting entity list...' + Date.now() + '\n')
            let ret = [];
            for (let [type, db] of Object.entries(databases))
                ret += Array.from(db.keys()).map(x => ({ name: x, type: type }))
            appendFile('/home/exr0n/snap/dbman.log', `entity list complete ${ret.length} total entities` + Date.now() + '\n')
            return ret;
        },
        getItemBlurb: async (type, name) => {
            if (databases[type].has(name)) return databases[type].get(name).getBlurb();
            else throw Error(`<${type}> ${entity_name} not found!`);
        },
        getItemDescription: async (type, name) => {
            if (databases[type].has(name)) return `- .likes/Coco\n- .likes/cado\n`; // TODO: make the reference-generation code
            else throw Error(`<${type}> ${entity_name} not found!`);
        },
        setNoteObjects: async (file_id, objects) => {
            // TODO: dry
            file_log(`transforming for db input...\n`)
            const [ entities, tags, relations ] = objects;
            Object.entries(entities).forEach(([ent, refs]) => {
                if (!db_ents.has(ent)) db_ents.set(ent, new Rel(ent));
                db_ents.get(ent).set_refs_by_file(file_id, refs);
            })
            Object.entries(tags).forEach(([tag, refs]) => {
                if (!db_tags.has(tag)) db_tags.set(tag, new Tag(tag));
                db_tags.get(tag).set_refs_by_file(file_id, refs);
            })
            Object.entries(relations).forEach(([rel, refs]) => {
                if (!db_rels.has(rel)) db_rels.set(rel, new Rel(rel));
                db_rels.get(rel).set_refs_by_file(file_id, refs);
            })
            file_log(`tags: ${Array.from(db_tags.keys()).join(', ')}\nentities: ${Array.from(db_ents.keys()).join(', ')}\nrelations: ${Array.from(db_rels.keys()).join(', ')}\n`)
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(entities) + '\n');
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(tags) + '\n\n');
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(relations) + '\n\n');
        }
    };
}
