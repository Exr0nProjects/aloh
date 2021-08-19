use indexmap::IndexMap;
use std::rc::{ Rc, Weak };
use std::cell::RefCell;

use crate::prototypes::{ Item, LineSpan };
//use crate::prototypes::{ Item, Entity, Tag, Relation, NoteID, EntityID, TagID, RelationID, RelationInstance };

thread_local! {
    static DB_OBJECTS: RefCell<IndexMap<String, Item>>    = RefCell::new(IndexMap::new());
    static PREV_OBJECTS: RefCell<IndexMap<String, Vec<String>>> = RefCell::new(IndexMap::new());
    //static DB_ENT: RefCell<IndexMap<String,   Rc<Entity>>>    = RefCell::new(IndexMap::new());
    //static DB_TAG: RefCell<IndexMap<String,      Rc<Tag>>>       = RefCell::new(IndexMap::new());
    //static DB_REL: RefCell<IndexMap<String, Rc<Relation>>>  = RefCell::new(IndexMap::new());
    //
    //static PREV_ENT: RefCell<IndexMap<NoteID, Vec<EntityID>>>   = RefCell::new(IndexMap::new());
    //static PREV_TAG: RefCell<IndexMap<NoteID, Vec<TagID>>>      = RefCell::new(IndexMap::new());
    //static PREV_REL: RefCell<IndexMap<NoteID, Vec<RelationID>>> = RefCell::new(IndexMap::new());
}

fn update_db(note: &String, kind: &String, name: String, spans: Vec<LineSpan>) {
    DB_OBJECTS.with(|db| {
            let mut db = db.borrow_mut();
            let entry = db.entry(name.clone()).or_insert(Item::new(kind.clone(), name));
            if spans.len() == 0 {
                entry.locs.remove(note);
            } else {
                entry.locs.insert(note.clone(), spans);
            }
    });
    // TODO: remove old ones
    // TODO: update the PREV_*
}

pub fn update_note(note: &String, objs: Vec<(&String, String, Vec<LineSpan>)>) {
    for (kind, name, spans) in objs {
        update_db(note, kind, name, spans);
    }
}

pub fn suggest(contents: String, line: i32, col: i32) -> Vec<(String, String)> {
    vec![
        ("ent".to_owned(), "Huxley Marvit".to_owned()),
        ("ent".to_owned(), "Jacob Cole".to_owned()),
        ("ent".to_owned(), "Zachary Sayyah".to_owned()),
        ("ent".to_owned(), "Isabelles hi".to_owned()),
    ]
}
//pub fn suggest(contents: String, line: i32, col: i32) -> Vec<Weak<impl Item>> {
//    let hux = Rc::new(Entity::new("Huxley Marvit".to_owned().into()));
//    let jacob = Rc::new(Entity::new("Jacob Cole".to_owned().into()));
//    let zach = Rc::new(Entity::new("Zachary Sayyah".to_owned().into()));
//    return vec![
//        Rc::downgrade(&hux),
//        Rc::downgrade(&jacob),
//        Rc::downgrade(&zach),
//    ];
//}
//pub fn get_blurb(item: Item) -> String { 
//    return item.get_blurb();
//}
//pub fn get_summary(item: Item) -> String { [> TODO <] }
