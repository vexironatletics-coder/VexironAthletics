/**
 * Fails the Hostinger build loudly if frontend/.next was not created.
 */
const fs = require('fs');
const path = require('path');

const buildId = path.join(__dirname, '..', 'frontend', '.next', 'BUILD_ID');

if (!fs.existsSync(buildId)) {
  console.error('');
  console.error('========================================');
  console.error('BUILD FAILED: frontend/.next not found');
  console.error('The Next.js frontend build did not complete.');
  console.error('Check Hostinger build logs for frontend errors.');
  console.error('========================================');
  console.error('');
  process.exit(1);
}

console.log('[Build] Verified frontend/.next exists — deploy OK');
