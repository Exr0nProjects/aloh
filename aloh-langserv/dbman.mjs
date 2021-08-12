// for now we will re-sweep the entire directory every time. then, move to re-sweeping on launch and finally an actual DB
'use strict';

import { appendFile } from 'fs/promises';

class Entity {    // not a class because https://stackoverflow.com/a/28281845/10372825
    constructor(/*workspace,*/ name, akas=new Set(), mentions=new Map()) {
        //this.workspace = workspace; // TODO: should entities know their workspace
        this.name = name;
        this.akas = akas;
        this.mentions = mentions;   // of the form 'field': [linenr, linenr]
    }
    // methods
    async set_mentions_by_file(file_id, mentions) {
        if (mentions.length === 0) {
            this.mentions.delete(file_id);
            if (this.mentions.size === 0) {
                db_entities.delete(this.name);
            }
        } else {
            this.mentions.set(file_id, mentions);
        }
    }
    toString() {
        return `<Entity ${this.name}, ${JSON.stringify(Object.fromEntries(this.mentions), null, 4)}>`
    }
}
var db_entities = new Map();
function load_entities() {
    // TODO
}

export default async function(/* NOTE: should this take workspace as an arg */) {
    load_entities();
    return {
        getEntityList: async () => {
            return Array.from(db_entities.keys());  // TODO: add some metadata, eg. time or usage
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
            const [ entities, tags, relations ] = objects;
            Object.entries(entities).forEach(([ent, { file_id, lines }]) => {
                ent = ent.toString();
                if (!db_entities.has(ent)) {
                    db_entities.set(ent, new Entity(ent));
                }
                db_entities.get(ent).set_mentions_by_file(file_id, lines)
                // TODO: cache entities by file and delete them if they got changed
            })
            appendFile('/home/exr0n/snap/dbman.log', JSON.stringify(tags) + '\n\n');
            // TODO: do stuff with tags, relations
        }
    };
}
