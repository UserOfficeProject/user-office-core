const fs = require('fs');
const args = process.argv.length;
console.log("running")
if(process.argv.length !== 4) {
    console.error('Usage: node copyIfNotExist.js <source-file> <dest-file>');
    process.exit(1);
}

const src = process.argv[2];
const dest = process.argv[3];

if (fs.existsSync(dest)) {
    process.exit(0);
}

if (!fs.existsSync(src)) {
    console.error("source file does not exist", src);
}

fs.copyFileSync(src, dest);