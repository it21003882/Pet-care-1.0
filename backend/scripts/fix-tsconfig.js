const fs = require('fs');
const path = require('path');

const findTsconfigs = (dir) => {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        // skip large folders where we won't find additional configs, but still check node_modules
        if (ent.name === 'dist' || ent.name === '.git') continue;
        results.push(...findTsconfigs(full));
      } else if (ent.isFile() && ent.name === 'tsconfig.json') {
        results.push(full);
      }
    }
  } catch (e) {
    // ignore
  }
  return results;
};

const root = path.join(__dirname, '..');
const files = findTsconfigs(root);

if (!files.length) {
  console.log('No tsconfig.json files found under', root);
  process.exit(0);
}

let changed = 0;
for (const file of files) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    let cfg;
    try {
      cfg = JSON.parse(raw);
    } catch (e) {
      // not JSON parsable, skip
      continue;
    }

    if (!cfg.compilerOptions) cfg.compilerOptions = {};

    if (cfg.compilerOptions.moduleResolution === 'node10') {
      cfg.compilerOptions.moduleResolution = 'node';
      fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n');
      console.log(`Patched moduleResolution in ${file}`);
      changed++;
    }
  } catch (err) {
    // continue
  }
}

if (changed === 0) console.log('tsconfig.json OK — no changes made');
else console.log(`Patched ${changed} tsconfig.json file(s)`);
