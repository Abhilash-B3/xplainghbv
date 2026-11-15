import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const outputZipPath = path.join(rootDir, 'xplain-production-hostinger.zip');
const zip = new JSZip();

function addDirectoryToZip(zipFolder, dirPath, rootRelative = '') {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const nestedFolder = zipFolder.folder(item);
      addDirectoryToZip(nestedFolder, fullPath, path.join(rootRelative, item));
    } else {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(item, content);
    }
  }
}

console.log('📦 Gathering production files...');

// 1. Root configuration & package files
const filesToInclude = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html'
];

for (const file of filesToInclude) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    zip.file(file, fs.readFileSync(fullPath));
    console.log(` + ${file}`);
  }
}

// 2. Directories
const dirsToInclude = [
  { path: 'dist', name: 'dist' },
  { path: 'backend/dist', name: 'backend/dist' },
  { path: 'backend/src', name: 'backend/src' },
  { path: 'backend/tsconfig.json', name: 'backend/tsconfig.json', isFile: true },
  { path: 'prisma', name: 'prisma' },
  { path: 'public', name: 'public' },
  { path: 'src/data', name: 'src/data' }
];

for (const item of dirsToInclude) {
  const fullPath = path.join(rootDir, item.path);
  if (fs.existsSync(fullPath)) {
    if (item.isFile) {
      zip.file(item.name, fs.readFileSync(fullPath));
      console.log(` + ${item.name}`);
    } else {
      const folder = zip.folder(item.name);
      addDirectoryToZip(folder, fullPath);
      console.log(` + folder: ${item.name}/`);
    }
  }
}

// 3. Add PM2 configuration
const pm2Config = `module.exports = {
  apps: [
    {
      name: 'xplain-api',
      script: './backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
`;
zip.file('ecosystem.config.cjs', pm2Config);
console.log(' + ecosystem.config.cjs (PM2 config)');

// 4. Add Linux Setup Script
const setupSh = `#!/usr/bin/env bash
set -e
echo "=========================================================="
echo "🚀 Xplain GH BV - Automated Hostinger Setup & Deployment"
echo "=========================================================="

echo "📦 1. Installing production dependencies..."
npm install --omit=dev

echo "🗄️ 2. Generating Prisma Client..."
npx prisma generate

echo "📊 3. Applying Database Schema (if DB is configured)..."
if [ -n "$DATABASE_URL" ]; then
  npx prisma db push --skip-generate || echo "Database push skipped or already up to date."
fi

echo "=========================================================="
echo "✅ Setup finished! Start application with:"
echo "   pm2 start ecosystem.config.cjs"
echo "   pm2 save && pm2 startup"
echo "=========================================================="
`;
zip.file('setup.sh', setupSh);
console.log(' + setup.sh (automated server setup)');

// 5. Add .env.production template
const envExample = `# ==============================================================================
# XPLAIN GH BV - HOSTINGER PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================
NODE_ENV=production
PORT=5000

# DOMAIN CONFIGURATION (Replace with your actual domain or Hostinger server IP)
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api/v1
PORTAL_NAME="Xplain GH BV Partner Portal"

# DATABASE (PostgreSQL 16)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/xplain_production?schema=public"

# REDIS CACHE & SESSION STORE
# Format: redis://:PASSWORD@HOST:PORT
REDIS_URL="redis://127.0.0.1:6379"

# SECURITY & AUTHENTICATION SECRETS (Generate 64+ char random strings)
SESSION_SECRET="prod_sec_random_sha256_secure_key_xplain_gh_bv_2026_hostinger"
CSRF_SECRET="prod_csrf_random_sha256_secure_key_xplain_gh_bv_2026_hostinger"
COOKIE_DOMAIN=""

# LIVE STRIPE PAYMENT CREDENTIALS
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# RATE LIMITING & SECURITY
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
`;
zip.file('.env.example', envExample);
console.log(' + .env.example (Production template)');

// Generate the zip file
console.log('\n⏳ Generating high-compression ZIP archive...');
const content = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 }
});

fs.writeFileSync(outputZipPath, content);

const stats = fs.statSync(outputZipPath);
console.log(`\n======================================================`);
console.log(`✅ Production Zip Created Successfully!`);
console.log(`📁 File Location: ${outputZipPath}`);
console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`======================================================\n`);
