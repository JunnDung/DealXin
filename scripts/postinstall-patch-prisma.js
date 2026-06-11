/**
 * Patches @prisma/client type re-exports to point to the correct location
 * in a pnpm monorepo where the generated .prisma/client lives in apps/node_modules/.
 *
 * Also runs `prisma generate` if the generated client doesn't exist yet,
 * ensuring @prisma/client types resolve correctly after a fresh install.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const prismaClientDir = path.join(rootDir, 'node_modules/@prisma/client');
const generatedClientDir = path.join(rootDir, 'apps/node_modules/.prisma/client');

/** Relative path from node_modules/@prisma/client to the generated client */
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
        `${TARGET_PATH}/default)`,
      );
    } else {
      newContent = content.replace(
        /\.prisma\/client['"]?\)/,
        `'${TARGET_PATH}')`,
      );
    }
    fs.writeFileSync(filePath, newContent);
    console.log(`  Patched: ${path.relative(rootDir, filePath)}`);
  } else {
    console.log(`  Skipped (no prisma reference): ${path.relative(rootDir, filePath)}`);
  }
}

// Step 1: Run prisma generate if the generated client doesn't exist yet.
// This ensures the generated types are available when we patch.
if (!fs.existsSync(generatedClientDir)) {
  console.log('Generating Prisma Client...');
  try {
    execSync('pnpm --filter api prisma generate', {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    });
    console.log('  Prisma Client generated successfully.');
  } catch (err) {
    console.error('  Failed to generate Prisma Client:', err.message);
    process.exit(1);
  }
} else {
  console.log('Prisma Client already generated, skipping generate step.');
}

console.log('Patching @prisma/client re-exports...');
console.log(`  Generated client: ${generatedClientDir}`);
console.log(`  Exists: ${fs.existsSync(generatedClientDir)}`);

const filesToPatch = [
  path.join(prismaClientDir, 'index.d.ts'),
  path.join(prismaClientDir, 'default.d.ts'),
  path.join(prismaClientDir, 'index.js'),
  path.join(prismaClientDir, 'default.js'),
];

for (const file of filesToPatch) {
  if (fs.existsSync(file)) {
    patchFile(file);
  } else {
    console.log(`  Missing: ${path.relative(rootDir, file)}`);
  }
}

console.log('Done.');
