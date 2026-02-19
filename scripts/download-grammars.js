const https = require('https');
const fs    = require('fs');
const path  = require('path');

const GRAMMARS_DIR = path.join(__dirname, '..', 'grammars');

const GRAMMARS = [
  {
    name    : 'tree-sitter-python.wasm',
    url     : 'https://cdn.jsdelivr.net/npm/tree-sitter-python@0.21.0/tree-sitter-python.wasm',
    language: 'Python',
  },
  {
    name    : 'tree-sitter-javascript.wasm',
    url     : 'https://cdn.jsdelivr.net/npm/tree-sitter-javascript@0.21.3/tree-sitter-javascript.wasm',
    language: 'JavaScript',
  },
  {
    name    : 'tree-sitter-java.wasm',
    url     : 'https://cdn.jsdelivr.net/npm/tree-sitter-java@0.21.0/tree-sitter-java.wasm',
    language: 'Java',
  },
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    function get(url) {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', reject);
    }

    get(url);
  });
}

async function main() {
  if (!fs.existsSync(GRAMMARS_DIR)) {
    fs.mkdirSync(GRAMMARS_DIR, { recursive: true });
  }

  for (const grammar of GRAMMARS) {
    const destPath = path.join(GRAMMARS_DIR, grammar.name);

    if (fs.existsSync(destPath)) {
      console.log(`  ✓ ${grammar.language} grammar already present — skipping`);
      continue;
    }

    process.stdout.write(`  ↓ Downloading ${grammar.language} grammar…`);

    try {
      await download(grammar.url, destPath);
      console.log(' done');
    } catch (err) {
      console.error(`\n  ✗ Failed: ${err.message}`);
    }
  }
}

main().catch(console.error);
