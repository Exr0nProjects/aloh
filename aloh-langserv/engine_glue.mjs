// run with node --experimental-specifier-resolution=node engine_glue.mjs
import Engine from '../aloh-engine';

export async function gen_completions() {
    return Engine.genCompletions();
}

