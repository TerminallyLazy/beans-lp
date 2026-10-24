import { readFile, writeFile } from 'node:fs/promises';
import { render } from '../.ssr/entry-server.js';

const file = new URL('../dist/index.html', import.meta.url);
const html = await readFile(file, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('Prerender placeholder is missing');
await writeFile(file, html.replace('<!--app-html-->', render()));
console.log('Prerendered the opening and accessible story.');
