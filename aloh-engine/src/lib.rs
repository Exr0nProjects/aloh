use neon::prelude::*;

use std::rc::{ Rc, Weak };

mod parse;
mod prototypes;
mod objects;
use parse::parse_note;
use prototypes::{ Item, RelationInstance };
use objects::suggest;

fn generate_completions(mut cx: FunctionContext) -> JsResult<JsArray> {

    let suggestions = suggest("".to_owned(), 0, 0 /* TODO */); 

    let js_array = JsArray::new(&mut cx, suggestions.len() as u32);

    for (i, item) in suggestions.iter().enumerate() {
        if let Some(rc) = item.upgrade() {
            let obj = JsObject::new(&mut cx);
            let typ = item.get_type();
            obj.set(&mut cx, "type", item.get_type())?;
            js_array.set(&mut cx, i as u32, obj).unwrap();
        }
    }
    Ok(js_array)
}

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    //cx.export_function("scan_workspace", scan_workspace)?;
    //cx.export_function("update_file", update_file)?;
    cx.export_function("genCompletions", generate_completions)?;
    //cx.export_function("genBlurb", generate_blurb)?;
    //cx.export_function("genSummary", generate_summary)?;
    Ok(())
}
