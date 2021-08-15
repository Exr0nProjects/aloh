import { appendFile } from 'fs/promises';

export function hasOwn(instance, prop) {
    // from https://stackoverflow.com/a/60463213/10372825
    return Object.prototype.hasOwnProperty.call(instance, prop);
}

export function file_log(text) {
    appendFile('/home/exr0n/snap/dbman.log', text + '\n');
}
