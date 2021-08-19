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

    for (i, (typ, val)) in suggestions.iter().enumerate() {
        let obj = JsObject::new(&mut cx);
        let typ = cx.string(typ);
        let val = cx.string(val);
        obj.set(&mut cx, "type", typ)?;
        obj.set(&mut cx, "name", val)?;
        js_array.set(&mut cx, i as u32, obj).unwrap();
    }
    Ok(js_array)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    //cx.export_function("scan_workspace", scan_workspace)?;
    //cx.export_function("update_file", update_file)?;
    cx.export_function("genCompletions", generate_completions)?;
    //cx.export_function("genBlurb", generate_blurb)?;
    //cx.export_function("genSummary", generate_summary)?;
    Ok(())
}
