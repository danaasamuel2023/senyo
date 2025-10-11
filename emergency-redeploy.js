#!/usr/bin/env node

/**
 * Emergency redeploy by making significant changes to force immediate rebuild
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 Emergency Redeploy - Force Immediate Server Restart');
console.log('=====================================================');

try {
  // 1. Modify server/index.js with significant change
  const serverIndexPath = path.join(__dirname, 'server', 'index.js');
  let content = fs.readFileSync(serverIndexPath, 'utf8');
  
  const timestamp = new Date().toISOString();
  const emergencyComment = `// EMERGENCY REDEPLOY: ${timestamp} - CRITICAL: Load new routes immediately\n`;
  
  // Remove any existing emergency comments
  content = content.replace(/\/\/ EMERGENCY REDEPLOY:.*\n/g, '');
  
  // Add emergency comment at the very top
  const lines = content.split('\n');
  lines.splice(1, 0, emergencyComment);
  content = lines.join('\n');
  
  fs.writeFileSync(serverIndexPath, content);
  console.log('✅ Modified server/index.js with emergency redeploy trigger');

  // 2. Create a new file to force rebuild
  const emergencyFile = path.join(__dirname, 'server', 'EMERGENCY_REDEPLOY.js');
  const emergencyContent = `// Emergency redeploy file - ${timestamp}
// This file forces Render.com to rebuild the application
// Delete this file after successful deployment

console.log('Emergency redeploy triggered:', '${timestamp}');

module.exports = {
  timestamp: '${timestamp}',
  purpose: 'Force Render.com redeploy to load new routes'
};
`;
  
  fs.writeFileSync(emergencyFile, emergencyContent);
  console.log('✅ Created emergency redeploy file');

  // 3. Modify package.json with version bump
  const packagePath = path.join(__dirname, 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Bump version to force rebuild
  const versionParts = (packageContent.version || '1.0.0').split('.');
  versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
  packageContent.version = versionParts.join('.');
  packageContent.description = `Emergency redeploy ${timestamp}`;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
  console.log('✅ Modified package.json with version bump');

  // 4. Modify server package.json
  const serverPackagePath = path.join(__dirname, 'server', 'package.json');
  const serverPackageContent = JSON.parse(fs.readFileSync(serverPackagePath, 'utf8'));
  
  const serverVersionParts = (serverPackageContent.version || '1.0.0').split('.');
  serverVersionParts[2] = (parseInt(serverVersionParts[2]) + 1).toString();
  serverPackageContent.version = serverVersionParts.join('.');
  serverPackageContent.description = `Emergency redeploy ${timestamp}`;
  
  fs.writeFileSync(serverPackagePath, JSON.stringify(serverPackageContent, null, 2));
  console.log('✅ Modified server/package.json with version bump');

  console.log('\n📝 Emergency Changes Made:');
  console.log(`   - Emergency redeploy trigger: ${timestamp}`);
  console.log('   - Modified server/index.js');
  console.log('   - Created EMERGENCY_REDEPLOY.js file');
  console.log('   - Bumped package.json versions');
  console.log('   - Modified server/package.json');
  
  console.log('\n🚨 CRITICAL: Immediate Action Required');
  console.log('=====================================');
  console.log('1. COMMIT NOW: git add . && git commit -m "EMERGENCY: Force immediate redeploy"');
  console.log('2. PUSH NOW: git push origin main');
  console.log('3. Render.com will detect changes and rebuild IMMEDIATELY');
  console.log('4. Wait 2-3 minutes for deployment');
  console.log('5. Test endpoints: node test-working-endpoints.js');
  
  console.log('\n🎯 Expected Results After Emergency Redeploy:');
  console.log('   ✅ /api/v1/wallet-deposit should return 401 (not 404)');
  console.log('   ✅ /api/v1/paystack-webhook should return 405 (not 404)');
  console.log('   ✅ All new routes should be accessible');
  
  console.log('\n⚠️  IMPORTANT: Delete EMERGENCY_REDEPLOY.js after successful deployment');

} catch (error) {
  console.error('❌ Emergency redeploy failed:', error.message);
}
