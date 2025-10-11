#!/usr/bin/env node

/**
 * Force redeploy by making significant changes to trigger Render.com rebuild
 */

const fs = require('fs');
const path = require('path');

// Files to modify to force redeploy
const filesToModify = [
  'server/index.js',
  'server/package.json',
  'package.json'
];

console.log('🚀 Forcing Redeploy to Load New Routes');
console.log('=====================================');

try {
  // 1. Modify server/index.js
  const serverIndexPath = path.join(__dirname, 'server', 'index.js');
  let content = fs.readFileSync(serverIndexPath, 'utf8');
  
  // Add a significant comment at the top
  const timestamp = new Date().toISOString();
  const deployComment = `// FORCE REDEPLOY: ${timestamp} - Loading new wallet and webhook routes\n`;
  
  // Remove any existing force redeploy comments
  content = content.replace(/\/\/ FORCE REDEPLOY:.*\n/g, '');
  
  // Add new comment after the first line
  const lines = content.split('\n');
  lines.splice(1, 0, deployComment);
  content = lines.join('\n');
  
  fs.writeFileSync(serverIndexPath, content);
  console.log('✅ Modified server/index.js');

  // 2. Modify server/package.json to trigger dependency rebuild
  const serverPackagePath = path.join(__dirname, 'server', 'package.json');
  if (fs.existsSync(serverPackagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
    
    // Add a comment to the description to trigger rebuild
    if (!packageContent.description) {
      packageContent.description = '';
    }
    packageContent.description += ` [Redeploy: ${timestamp}]`;
    
    fs.writeFileSync(serverPackagePath, JSON.stringify(packageContent, null, 2));
    console.log('✅ Modified server/package.json');
  }

  // 3. Modify root package.json
  const rootPackagePath = path.join(__dirname, 'package.json');
  if (fs.existsSync(rootPackagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
    
    // Add a comment to the description to trigger rebuild
    if (!packageContent.description) {
      packageContent.description = '';
    }
    packageContent.description += ` [Redeploy: ${timestamp}]`;
    
    fs.writeFileSync(rootPackagePath, JSON.stringify(packageContent, null, 2));
    console.log('✅ Modified package.json');
  }

  console.log('\n📝 Changes Made:');
  console.log(`   - Added redeploy trigger comment: ${timestamp}`);
  console.log('   - Modified server/index.js');
  console.log('   - Modified server/package.json');
  console.log('   - Modified package.json');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Commit these changes: git add . && git commit -m "Force redeploy to load new routes"');
  console.log('2. Push to GitHub: git push origin main');
  console.log('3. Render.com will automatically detect changes and rebuild');
  console.log('4. Wait 3-5 minutes for deployment to complete');
  console.log('5. Test endpoints: node test-working-endpoints.js');
  
  console.log('\n🔍 Expected Results After Redeploy:');
  console.log('   ✅ /api/wallet/deposit should return 401 (not 404)');
  console.log('   ✅ /api/v1/paystack-webhook should return 405 (not 404)');
  console.log('   ✅ All new routes should be accessible');

} catch (error) {
  console.error('❌ Error forcing redeploy:', error.message);
}
