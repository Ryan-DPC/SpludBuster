const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'games', 'SpludBuster');
const filesToMove = [
    '.env.exemple',
    '.gitattributes',
    '.github',
    '.gitignore',
    'LICENSE',
    'README.md',
    'assets',
    'game.js',
    'index.html',
    'logo.png',
    'main.js',
    'manifest.json',
    'package-lock.json',
    'package.json',
    'src'
];

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

filesToMove.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(targetDir, file);
    if (fs.existsSync(srcPath)) {
        try {
            fs.renameSync(srcPath, destPath);
            console.log(`Moved ${file}`);
        } catch (err) {
            console.error(`Failed to move ${file}: ${err.message}`);
            try {
                fs.cpSync(srcPath, destPath, { recursive: true });
                fs.rmSync(srcPath, { recursive: true, force: true });
                console.log(`Copied and deleted ${file}`);
            } catch (err2) {
                console.error(`Failed to copy/delete ${file}: ${err2.message}`);
            }
        }
    } else {
        console.log(`Skipped ${file} (not found)`);
    }
});
