import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

export function getAllFiles(dir, root = dir) {
  return readdirSync(dir).reduce((files, file) => {
    const name = join(dir, file);
    const isDirectory = statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name, root)] : [...files, join('/', relative(root, name))];
  }, []);
}