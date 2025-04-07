const fs = require('fs');

if (process.argv.length !== 4) {
    console.error('Usage: node copyIfNotExist.js <source-file> <dest-file>');
    process.exit(1);
}

const [src, dest] = process.argv.slice(2);

if (fs.existsSync(dest)) {
    process.exit(0);
}

if (!fs.existsSync(src)) {
    console.error(`Source file does not exist: ${src}`);
    process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`File copied from ${src} to ${dest}`);
