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
        if (this.mentions.size === 0) {
            // TODO: remove this entity from the list
        }
    }
}
var entities = new Map();
function load_entities() {
    // TODO
}

//export default async function() { return 3 };

export default async function(workspace, connection) {
    load_entities();
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
            appendFile('/home/exr0n/snap/dbman.log', 'entities:\n' + JSON.stringify(entities, null, 2) + '\n\n\n');
            //entities.entries().forEach(([ent, { lines }]) => {
            //
            //})
            // TODO: do stuff with entities, tags, relations
        }
    };
}
