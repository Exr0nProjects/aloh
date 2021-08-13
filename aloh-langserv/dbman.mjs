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
function load_entities() {
    // TODO
}

function file_log(text) {
    appendFile('/home/exr0n/snap/dbman.log', text + '\n');
}

export default async function(/* NOTE: should this take workspace as an arg */) {
    load_entities();
    let tag = new Tag('test');
    return {
        getEntityList: async () => {
            return Array.from(db_ents.keys());  // TODO: add some metadata, eg. time or usage
        },
        getAkasForEntity: async (entity_name) => {
            if (db_entities.has(entity_name)) return ['thing1', 'thing2']; /* TODO: databaseify */
            else throw Error(`Entity ${entity_name} not found!`);
        },
        getReferenceForEntity: async (entity_name) => {
            if (db_entities.has(entity_name)) return `- .likes/Coco\n- .likes/cado\n`; // TODO: make the reference-generation code
            else throw Error(`Entity ${entity_name} not found!`);
        },
        setNoteObjects: async (file_id, objects) => {
            //const [ entities, tags, relations ] = objects;
            //Object.entries(entities).forEach(([ent, { file_id, lines }]) => {
            //    ent = ent.toString();
            //    if (!db_entities.has(ent)) {
            //        db_entities.set(ent, new Entity(ent));
            //    }
            //    db_entities.get(ent).set_mentions_by_file(file_id, lines)
            //    // TODO: cache entities by file and delete them if they got changed
            //})

            // TODO: dry
            const [ entities, tags, relations ] = objects;
            Object.entries(entities).forEach(([ent, refs]) => {
                if (!db_ents.has(ent)) db_rels.set(ent, new Rel(ent));
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
            file_log(`tags: ${Array.from(db_tags.keys()).join(', ')}\nentities: ${Array.from(db_entities.keys()).join(', ')}\nrelations: ${Array.from(db_rels.keys()).join(', ')}\n`)
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(entities) + '\n');
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(tags) + '\n\n');
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(relations) + '\n\n');
            // TODO: do stuff with tags, relations
        }
    };
}
