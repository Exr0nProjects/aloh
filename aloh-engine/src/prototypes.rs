use indexmap::IndexMap;
use derive_more::{ From, Into, Display };
use chrono::{ DateTime, Local };

#[derive(Clone, PartialEq, Eq, Debug, Hash, From, Into, Display)]
pub struct NoteID(pub String);
// can't use enum variants as types: https://github.com/rust-lang/rfcs/issues/754
#[derive(Clone, PartialEq, Eq, Debug, Hash, From, Into, Display)]
pub struct EntityID(pub String);
#[derive(Clone, PartialEq, Eq, Debug, Hash, From, Into, Display)]
pub struct TagID(pub String);
#[derive(Clone, PartialEq, Eq, Debug, Hash, From, Into, Display)]
pub struct RelationID(pub String);
#[derive(Clone, PartialEq, Eq, Debug, Hash, Display)]
pub enum ItemID {   
    Entity(EntityID),
    Tag(TagID),
    Relation(RelationID),
}

#[derive(Clone, PartialEq, Eq, Debug, Hash)]
pub struct LineSpan {
    note: String, 
    line: i32,
    start: i32,
    stop: i32,
}
#[derive(Clone, Eq, Debug)]
pub struct RelationInstance {
    //locs: IndexMap<NoteID, Vec<LineSpan>>    // TODO: what about bulleted relations? implicit?
    note: String,
    when: DateTime<Local>,

    lhv: ItemID,
    chv: RelationID,
    rhv: ItemID,

    lhs: LineSpan,
    chs: LineSpan,
    rhs: LineSpan,
}
impl PartialEq for RelationInstance {
    fn eq(&self, other: &Self) -> bool {
           self.lhv == other.lhv
        && self.chv == other.chv
        && self.rhv == other.rhv
    }
}


pub trait Item {
    fn get_name(&self) -> String;
    fn get_type(&self) -> String;
    fn get_blurb(&self) -> String {
        // TODO
        return "is amazang".to_owned();
    }
    fn gen_summary(&self) -> String {
        // TODO
        return "- likes Coco\n- likes cado".to_owned();
    }
}

#[derive(Clone, Eq, Debug)]
pub struct Entity {
    name: EntityID,
    locs: IndexMap<NoteID, Vec<LineSpan>>,
    outgoing: IndexMap< EntityID, IndexMap<RelationID, Vec<RelationInstance>> >,
    incoming: IndexMap< EntityID, IndexMap<RelationID, Vec<RelationInstance>> >,
}
impl Entity {
    pub fn new(name: EntityID) -> Entity {
        Entity {
            name,
            locs: IndexMap::new(),
            incoming: IndexMap::new(),
            outgoing: IndexMap::new()
        }
    }
}
impl Item for Entity {
    fn get_name(&self) -> String { self.name.clone().into() }
    fn get_type(&self) -> String { "ent".to_owned() }
}
impl PartialEq for Entity {
    fn eq(&self, other: &Self) -> bool { self.name == other.name }
}
#[derive(Clone, Eq, Debug)]
pub struct Tag {
    name: TagID,
    locs: IndexMap<NoteID, Vec<LineSpan>>,
}
impl Tag {
    pub fn new(name: TagID) -> Tag {
        Tag { name, locs: IndexMap::new() }
    }
}
impl Item for Tag {
    fn get_name(&self) -> String { self.name.clone().into() }
    fn get_type(&self) -> String { "tag".to_owned() }
}
impl PartialEq for Tag {
    fn eq(&self, other: &Self) -> bool { self.name == other.name }
}
#[derive(Clone, Eq, Debug)]
pub struct Relation {
    name: RelationID,
    locs: IndexMap<NoteID, Vec<LineSpan>>,
}
impl Relation {
    pub fn new(name: RelationID) -> Relation {
        Relation { name, locs: IndexMap::new() }
    }
}
impl Item for Relation {
    fn get_name(&self) -> String { self.name.clone().into() }
    fn get_type(&self) -> String { "rel".to_owned() }
}
impl PartialEq for Relation {
    fn eq(&self, other: &Self) -> bool { self.name == other.name }
}
