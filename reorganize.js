const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_DIR = path.join(__dirname, 'games', 'SpludBuster');
const EXCLUSIONS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    '.cache',
    '.vite',
    '.next',
    'logs',
    '.DS_Store',
    'games', // Don't move the target parent folder
    'reorganize.js', // Don't move this script
    'move_files.bat',
    'move.js'
];

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
    console.log(`Creating directory: ${TARGET_DIR}`);
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Get all files and directories in the root
const items = fs.readdirSync(__dirname);

items.forEach(item => {
    // Skip exclusions
    if (EXCLUSIONS.includes(item)) {
        console.log(`Skipping excluded: ${item}`);
        return;
    }

    const srcPath = path.join(__dirname, item);
    const destPath = path.join(TARGET_DIR, item);

    // Skip if it's a test file/folder (basic check)
    if (item.includes('__tests__') || item.includes('.spec.js') || item.includes('test_')) {
        console.log(`Skipping test file/folder: ${item}`);
        return;
    }

    try {
        console.log(`Moving: ${item} -> ${destPath}`);
        // Try simple rename (move)
        fs.renameSync(srcPath, destPath);
    } catch (err) {
        // Fallback for cross-device or permission issues (copy + delete)
        if (err.code === 'EXDEV' || err.code === 'EPERM') {
            console.log(`Rename failed, attempting copy+delete for: ${item}`);
            try {
                if (fs.lstatSync(srcPath).isDirectory()) {
                    fs.cpSync(srcPath, destPath, { recursive: true });
                    fs.rmSync(srcPath, { recursive: true, force: true });
                } else {
                    fs.copyFileSync(srcPath, destPath);
                    fs.unlinkSync(srcPath);
                }
            } catch (copyErr) {
                console.error(`FAILED to move ${item}: ${copyErr.message}`);
            }
        } else {
            console.error(`Error moving ${item}: ${err.message}`);
        }
    }
});

console.log('\n--- Reorganization Complete ---');
console.log(`Project moved to: ${TARGET_DIR}`);
console.log('You can now delete "node_modules" from the root if it still exists.');
