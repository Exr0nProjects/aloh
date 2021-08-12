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
    async set_mentions_by_file(updates) {
        for (const [n, m] of Object.entries(updates))
            this.mentions.set(n, m);
        appendFile('/home/exr0n/snap/dbman.log', this.mentions.size + ' is the size of ' + this.name + '\n');
        if (this.mentions.size === 0) {
            // TODO: remove this entity from the list
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

//export default async function() { return 3 };

export default async function(workspace, connection) {
    load_entities();
    //let count =  0;
    return {
        // TODO: all the functions here need to be plugged into the db
        getEntityList: async () => {
            let ret = [];
            for (let i=1; i<=10000; i++) {
                ret.push(`amazing${i}`);
            }
            return ret;
        },
        getAkasForEntity: async (entity_name) => {
            if (parseInt(entity_name.replace('amazing', '')) < 100) return ['thing1', 'thing2'];
            else throw Error(`Entity ${entity_name} not found!`);
        },
        getReferenceForEntity: async (entity_name) => {
            if (parseInt(entity_name.replace('amazing', '')) < 100) return `- .likes/Coco\n- .likes/cado\n`
            else throw Error(`Entity ${entity_name} not found!`);
        },
        setNoteObjects: async (file_id, objects) => {
            const [ entities, tags, relations ] = objects;
            Object.entries(entities).forEach(([ent, { file_id, lines }]) => {
                if (!db_entities.has(ent)) db_entities[ent] = new Entity(ent);
                db_entities[ent].set_mentions_by_file(Object.fromEntries([[file_id, lines]]))
                //appendFile('/home/exr0n/snap/dbman.log', 'entities ' + db_entities[ent] + '\n');
            })
            //appendFile('/home/exr0n/snap/dbman.log', '\n\n\n');
            //appendFile('/home/exr0n/snap/dbman.log', 'operation #' + count++ + '\n');
            // TODO: do stuff with entities, tags, relations
        }
    };
}
