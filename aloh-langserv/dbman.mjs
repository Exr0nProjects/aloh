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
        //appendFile('/home/exr0n/snap/dbman.log', this.mentions.size + ' is the size of ' + this.name + '\n');
        if (mentions.length === 0) {
            this.mentions.delete(file_id);
            if (this.mentions.size === 0) {
                db_entities.delete(this.name);
                appendFile('/home/exr0n/snap/dbman.log', 'oofity boofity' + this.name + 'got yeetused\n');
            }
        } else {
            this.mentions.set(file_id, mentions);
        }
        //appendFile('/home/exr0n/snap/dbman.log', this.mentions.size + ' is the size of ' + this.name + '\n');
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
                ent = ent.toString();
                if (!db_entities.has(ent)) {
                    appendFile('/home/exr0n/snap/dbman.log', 'NEW ENTITY ' + ent + '\n');
                    db_entities.set(ent, new Entity(ent));
                }
                db_entities.get(ent).set_mentions_by_file(file_id, lines)
                // TODO: cache entities by file and delete them if they got changed
                //appendFile('/home/exr0n/snap/dbman.log', 'entities ' + db_entities[ent] + '\n');
            })
            //appendFile('/home/exr0n/snap/dbman.log', '\n\n\n');
            //appendFile('/home/exr0n/snap/dbman.log', 'operation #' + count++ + '\n');
            appendFile('/home/exr0n/snap/dbman.log', 'the map currently has' + db_entities.size + ' entities\n');
            // TODO: do stuff with entities, tags, relations
        }
    };
}
