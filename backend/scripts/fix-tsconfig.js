const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');

try {
  const raw = fs.readFileSync(tsconfigPath, 'utf8');
  const cfg = JSON.parse(raw);

  if (cfg && cfg.compilerOptions && cfg.compilerOptions.moduleResolution) {
    if (cfg.compilerOptions.moduleResolution === 'node10') {
      cfg.compilerOptions.moduleResolution = 'node';
      fs.writeFileSync(tsconfigPath, JSON.stringify(cfg, null, 2) + '\n');
      console.log("Patched moduleResolution 'node10' -> 'node' in tsconfig.json");
      process.exit(0);
    }
  }

  // also defensively ensure moduleResolution exists
  if (!cfg.compilerOptions) cfg.compilerOptions = {};
  if (!cfg.compilerOptions.moduleResolution) {
    cfg.compilerOptions.moduleResolution = 'node';
    fs.writeFileSync(tsconfigPath, JSON.stringify(cfg, null, 2) + '\n');
    console.log("Added moduleResolution 'node' to tsconfig.json");
  } else {
    console.log('tsconfig.json OK — no changes made');
  }
} catch (err) {
  console.error('Could not read or patch tsconfig.json:', err.message || err);
  process.exit(0);
}
