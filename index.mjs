import * as FS from 'fs';
import * as Path from 'path';
import * as Module from 'module'
import * as URL from 'url';
import { promisify } from 'util';

const CURRENT_URL = (import.meta.url + '').split('/');
CURRENT_URL.pop();
const CURRENT_DIR = CURRENT_URL.join('/');

const require = Module.createRequireFromPath(CURRENT_DIR);
const TypeScript = require('typescript');

const readFile = promisify(FS.readFile);
const writeFile = promisify(FS.writeFile);

const tsThis = async function (url, parent) {

    let src = URL.parse(url).path;
    if (parent) {
        const parentPath = URL.parse(parent).path;
        const parentDir = Path.dirname(parentPath);
        src = Path.join(parentDir, src)
    }

    const tsSrc = (await readFile(src)).toString();
    const transpiled = TypeScript.transpileModule(tsSrc, {
        compilerOptions: { module: TypeScript.ModuleKind.ES2015 }
    });
    await writeFile(src.replace('.ts', '.mjs'), transpiled.outputText);

    return url.replace('.ts', '.mjs');
};

export async function resolve(specifier, parentModuleURL, defaultResolver) {
    if (parentModuleURL && parentModuleURL.endsWith('.mjs') && !specifier.endsWith('.ts')) {
        specifier = specifier + '.ts';
    }
    if (specifier.endsWith('.ts')) {
        const newTarget = await tsThis(specifier, parentModuleURL);
        return defaultResolver(newTarget, parentModuleURL);
    }
    return defaultResolver(specifier, parentModuleURL);
}
