import * as FS from 'fs';
import * as Path from 'path';
import * as OS from 'os';
import { execSync } from 'child_process';

const CURRENT_URL = (import.meta.url + '').split('/');
CURRENT_URL.pop();
const CURRENT_DIR = CURRENT_URL.join('/');

const PREFIX = 'ts_modules-';
const TSC = Path.join(CURRENT_DIR, 'node_modules', '.bin', 'tsc').split('file:').pop().trim();

const tsThis = function (url) {

    console.log('TS', url)
    const out = url.replace('.ts', '.mjs');
    const tmpOut = url.replace('.ts', '.js');
    execSync(`${TSC} ${url} --module es6`);

    return out;
};

export async function resolve(specifier, parentModuleURL, defaultResolver) {
    if (specifier.endsWith('.ts')) {
        return defaultResolver(tsThis(specifier, parentModuleURL));
    }
    return defaultResolver(specifier, parentModuleURL);
}
