#!/usr/bin/env node

/**
 * Trigger redeploy by making a small change to force Render to rebuild
 * This will ensure the new routes are loaded
 */

const fs = require('fs');
const path = require('path');

// Add a comment to the server index file to trigger redeploy
const serverIndexPath = path.join(__dirname, 'server', 'index.js');

try {
  // Read the current file
  let content = fs.readFileSync(serverIndexPath, 'utf8');
  
  // Add a timestamp comment at the top to trigger redeploy
  const timestamp = new Date().toISOString();
  const deployComment = `// Redeploy triggered: ${timestamp}\n`;
  
  // Check if we already have a recent deploy comment
  if (!content.includes('Redeploy triggered:')) {
    // Add the comment after the first line
    const lines = content.split('\n');
    lines.splice(1, 0, deployComment);
    content = lines.join('\n');
    
    // Write back to file
    fs.writeFileSync(serverIndexPath, content);
    
    console.log('✅ Added redeploy trigger comment');
    console.log('📝 Timestamp:', timestamp);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Commit this change: git add . && git commit -m "Trigger redeploy for new routes"');
    console.log('2. Push to GitHub: git push origin main');
    console.log('3. Render.com will automatically redeploy');
    console.log('4. Wait 2-3 minutes for deployment to complete');
    console.log('5. Test the endpoints again');
  } else {
    console.log('ℹ️  Redeploy trigger already exists');
    console.log('🚀 If endpoints are still not working, try:');
    console.log('1. Check Render.com dashboard for deployment status');
    console.log('2. Check server logs for any errors');
    console.log('3. Verify environment variables are set correctly');
  }
} catch (error) {
  console.error('❌ Error triggering redeploy:', error.message);
}
