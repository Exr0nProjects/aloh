use neon::prelude::*;

mod parse;
use parse::parse_note;

mod prototypes;
use prototypes::{ Item, Entity, Tag, Relation, RelationInstance };

mod objects;
use objects::suggest;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    //cx.export_function("scan_workspace", scan_workspace)?;
    //cx.export_function("update_file", update_file)?;
    //cx.export_function("genCompletions", generate_completions)?;
    //cx.export_function("genBlurb", generate_blurb)?;
    //cx.export_function("genSummary", generate_summary)?;
    Ok(())
}
