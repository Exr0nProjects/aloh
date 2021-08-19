use indexmap::IndexMap;
use std::rc::{ Rc, Weak };

use crate::prototypes::{ Item, Entity, Tag, Relation, NoteID, EntityID, TagID, RelationID, RelationInstance };

static mut DB_ENT: IndexMap<EntityID,   Rc<Entity>>     = IndexMap::new();
static mut DB_TAG: IndexMap<TagID,      Rc<Tag>>        = IndexMap::new();
static mut DB_REL: IndexMap<RelationID, Rc<Relation>>   = IndexMap::new();

static mut PREV_ENT: IndexMap<NoteID, Vec<EntityID>>    = IndexMap::new();
static mut PREV_TAG: IndexMap<NoteID, Vec<TagID>>       = IndexMap::new();
static mut PREV_REL: IndexMap<NoteID, Vec<RelationID>>  = IndexMap::new();

pub fn update_note(note: NoteID, objs: Vec<Box<impl Item>>) {
    // TODO: remove old ones
    // TODO: update the PREV_*
}

pub fn suggest(contents: String, line: i32, col: i32) -> Vec<Weak<impl Item>> {
    let hux = Rc::new(Entity::new("Huxley Marvit".to_owned().into()));
    let jacob = Rc::new(Entity::new("Jacob Cole".to_owned().into()));
    let zach = Rc::new(Entity::new("Zachary Sayyah".to_owned().into()));
    return vec![
        Rc::downgrade(&hux),
        Rc::downgrade(&jacob),
        Rc::downgrade(&zach),
    ];
}
//pub fn get_blurb(item: Item) -> String { 
//    return item.get_blurb();
//}
//pub fn get_summary(item: Item) -> String { [> TODO <] }
