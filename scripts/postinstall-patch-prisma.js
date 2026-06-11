/**
 * Patches @prisma/client type re-exports to point to the correct location
 * in a pnpm monorepo where the generated .prisma/client lives in apps/node_modules/.
 *
 * Background: With pnpm + npm workspaces (apps/*), @prisma/client is symlinked to
 * the root node_modules, but prisma generate writes .prisma/client to
 * apps/node_modules/.prisma/client. The root @prisma/client/default.d.ts
 * re-exports from '.prisma/client/default' which doesn't exist there.
 * This script fixes those re-export paths.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const prismaClientDir = path.join(rootDir, 'node_modules/@prisma/client');
const generatedClientDir = path.join(rootDir, 'apps/node_modules/.prisma/client');

const TARGET_PATH = '../../../apps/node_modules/.prisma/client';

function patchFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(TARGET_PATH)) {
    console.log(`  Already patched: ${path.relative(rootDir, filePath)}`);
    return;
  }
  if (content.includes('.prisma/client/default') || content.includes('.prisma/client')) {
    let newContent;
    if (filePath.endsWith('.js')) {
      newContent = content.replace(
        /\.prisma\/client\/default\)/,
        `${TARGET_PATH}/default)`
      );
    } else {
      newContent = content.replace(
        /\.prisma\/client['"]?\)/,
        `'${TARGET_PATH}')`
      );
    }
    fs.writeFileSync(filePath, newContent);
    console.log(`  Patched: ${path.relative(rootDir, filePath)}`);
  } else {
    console.log(`  Skipped (no prisma reference): ${path.relative(rootDir, filePath)}`);
  }
}

const filesToPatch = [
  path.join(prismaClientDir, 'index.d.ts'),
  path.join(prismaClientDir, 'default.d.ts'),
  path.join(prismaClientDir, 'index.js'),
  path.join(prismaClientDir, 'default.js'),
];

console.log('Patching @prisma/client re-exports...');
console.log(`  Generated client: ${generatedClientDir}`);
console.log(`  Exists: ${fs.existsSync(generatedClientDir)}`);

for (const file of filesToPatch) {
  if (fs.existsSync(file)) {
    patchFile(file);
  } else {
    console.log(`  Missing: ${path.relative(rootDir, file)}`);
  }
}

console.log('Done.');
