// for now we will re-sweep the entire directory every time. then, move to re-sweeping on launch and finally an actual DB
'use strict';

import { hasOwn, file_log } from './util.mjs'

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
    getBlurb() {
        return `Appears ${Array.from(this.refs.values(), v => v.refs.length).reduce((a, b) => a + b, 0)} times.`
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
        return '.aka ' + (this.akas.length > 0 ? [...this.akas].join(', ') : '[none]') 
               + '\n' + super.getBlurb();
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
}
class Rel extends Item {
    constructor(name, refs=new Map()) {
        super(name, refs);
        this.type = 'rel';
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

export default async function(/* NOTE: should this take workspace as an arg */) {
    load_entities();
    return {
        getEntityNames: async () => {
            return Object.keys(databases['ent']);
        },
        getCompletionList: async () => {
            let ret = [];
            for (let db of Object.values(databases)) {
                // TODO: add some metadata, eg. time or usage
                ret = ret.concat(Array.from(Object.values(db))
                    .map(x => ({ name: x.name, type: x.type }))
                );
            }
            return ret;
        },
        getItemBlurb: async (type, name) => {
            if (hasOwn(databases[type], (name))) return databases[type][name].getBlurb();
            else throw Error(`<${type}> ${name} not found!`);
        },
        getItemDescription: async (type, name) => {
            if (hasOwn(databases[type], name)) return `- .likes/Coco\n- .likes/cado\n`; // TODO: make the reference-generation code
            else throw Error(`<${type}> ${name} not found!`);
        },
        setNoteObjects: async (file_id, objs) => {
            // add new entities
            for (const [type, things] of Object.entries(objs)) {
                Object.entries(things).forEach(([name, refs]) => {
                    if (!hasOwn(databases[type], name))
                        databases[type][name] = new prototypes[type](name);
                    databases[type][name].set_refs_by_file(file_id, refs);
                });
            }

            // remove existing entities
            if (hasOwn(prev_objs_by_file, file_id)) {
                for (const [type, names] of Object.entries(prev_objs_by_file[file_id])) 
                    for (const name of names)
                        if (!hasOwn(objs[type], name))
                            databases[type][name].set_refs_by_file(file_id, []);
            }
            let keys = {}
            for (const [type, db] of Object.entries(objs)) {
                keys[type] = Object.keys(db);
            }
            prev_objs_by_file[file_id] = keys;

            // show the database
            //file_log('\n\nUPDATE DATABASE\n')
            //for (const [type, db] of Object.entries(databases))
            //    file_log(`${type}: ${Array.from(Object.keys(db)).join(', ')}`)
        }
    };
}
