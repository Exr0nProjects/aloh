// for now we will re-sweep the entire directory every time. then, move to re-sweeping on launch and finally an actual DB
'use strict';

import { appendFile } from 'fs/promises';

class Item {
    constructor(name, refs=new Map()) {
        //this.workspace = workspace; // TODO: should entities know their workspace
        this.name = name;
        this.refs = refs;   // of the form 'file': [{ line, start, end }...]
        this.type = null;
    }
    // methods
    async set_refs_by_file(file_id, refs) {
        if (refs.length === 0) {
            this.refs.delete(file_id);
            if (this.refs.size === 0) {
                delete databases[this.type][this.name];
            }
        } else {
            this.refs.set(file_id, refs);
        }
    }
    toString() {
        return `<${this.type} ${this.name}, ${JSON.stringify(Object.fromEntries(this.mentions), null, 4)}>`
    }
}
class Ent extends Item {
    constructor(name, refs=new Map(), akas=new Set()) {
        super(name, refs);
        this.akas = akas;
        this.type = 'ent';
    }
    getBlurb() {
        return '.aka ' + [...this.akas].join(', ');
    }
    toString() {
        return `<Entity ${this.name}, ${JSON.stringify(Object.fromEntries(this.mentions), null, 4)}>`
    }
}
class Tag extends Item {
    constructor(name, refs=new Map()) {
        super(name, refs);
        this.type = 'tag';
    }
    getBlurb() {
        return `Referenced ${Array.from(this.refs.values(), v => v.length).reduce((a, b) => a + b, 0)} times.`
    }
}
class Rel extends Item {
    constructor(name, refs=new Map()) {
        super(name, refs);
        this.type = 'rel';
    }
    getBlurb() {
        return `Appears ${Array.from(this.refs.values(), v => v.length).reduce((a, b) => a + b, 0)} times.`
    }
}
const prototypes = {
    'ent': Ent,
    'tag': Tag,
    'rel': Rel,
}

var databases = {
    'ent': {},
    'tag': {},
    'rel': {},
}
var prev_objs_by_file = {};

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
            //appendFile('/home/exr0n/snap/dbman.log', 'getting entity list...' + Date.now() + '\n')
            let ret = ['amazing', 'cool', 'stuff'];
            //for (let [type, db] of Object.entries(databases)) {
            //    //ret += Array.from(Object.keys(db)).map(x => ({ name: x, type: type }))
            //    ret = ret.concat(Array.from(Object.keys(db)))
            //}
            //appendFile('/home/exr0n/snap/dbman.log', `entity list complete ${ret.length} total entities` + Date.now() + '\n')
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
            file_log(`transforming for db input...`)
            const objs = { ent: objects[0], tag: objects[1], rel: objects[2] };

            // add new entities
            for (const [type, things] of Object.entries(objs)) {
                Object.entries(things).forEach(([name, refs]) => {
                    file_log(`>   ${type}: ${name}`);
                    if (!databases[type].hasOwnProperty(name))
                        databases[type][name] = new prototypes[type](name);
                    databases[type][name].set_refs_by_file(file_id, refs);
                });
            }

            //Object.entries(tags).forEach(([tag, refs]) => {
            //    if (!db_tags.has(tag)) db_tags.set(tag, new Tag(tag));
            //    db_tags.get(tag).set_refs_by_file(file_id, refs);
            //})
            //Object.entries(relations).forEach(([rel, refs]) => {
            //    if (!db_rels.has(rel)) db_rels.set(rel, new Rel(rel));
            //    db_rels.get(rel).set_refs_by_file(file_id, refs);
            //})

            // remove existing entities
            if (prev_objs_by_file.hasOwnProperty(file_id)) {
                for (const [types, names] of Object.entries(prev_objs_by_file[file_id])) 
                    for (const name of names)
                        databases[types][name].set_refs_by_file(file_id, []);
            }
            for (const [type, db] of Object.entries(objs)) {
                objs[type] = Object.keys(db);
            }
            prev_objs_by_file[file_id] = objs;

            //file_log(`tags: ${Array.from(db_tags.keys()).join(', ')}\nentities: ${Array.from(db_ents.keys()).join(', ')}\nrelations: ${Array.from(db_rels.keys()).join(', ')}\n`)
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(entities) + '\n');
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(tags) + '\n\n');
            //appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(relations) + '\n\n');
            for (const [type, db] of Object.entries(databases))
                file_log(`${type}: ${Array.from(Object.keys(db)).join(', ')}`)
        }
    };
}
