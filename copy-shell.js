import fs from 'fs';
import path from 'path';

const src = path.join('dist', 'client', '_shell.html');
const dest = path.join('dist', 'client', 'index.html');

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Successfully copied ${src} to ${dest}`);
  } else {
    console.error(`Error: Source file ${src} does not exist.`);
    process.exit(1);
  }
} catch (err) {
  console.error('Error copying file:', err);
  process.exit(1);
}
