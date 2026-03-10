const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceDir = path.join(__dirname, '../frontend/src/assets/images');
const destDir = path.join(__dirname, '../frontend/public/images');

// Create destination directories
const categories = ['wooden', 'acrylic', 'metal', 'gifts', 'mementos', 'marble'];

console.log('📁 Creating image directories...');
categories.forEach(cat => {
  const destPath = path.join(destDir, cat);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
    console.log(`✅ Created: ${cat}`);
  }
});

// Copy images if they exist
if (fs.existsSync(sourceDir)) {
  console.log('\n📋 Copying images...');
  let copiedCount = 0;
  
  categories.forEach(cat => {
    const sourceCat = path.join(sourceDir, cat);
    const destCat = path.join(destDir, cat);
    
    if (fs.existsSync(sourceCat)) {
      const files = fs.readdirSync(sourceCat);
      files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          const sourceFile = path.join(sourceCat, file);
          const destFile = path.join(destCat, file);
          fs.copyFileSync(sourceFile, destFile);
          console.log(`✅ Copied: ${cat}/${file}`);
          copiedCount++;
        }
      });
    }
  });
  
  console.log(`\n✅ Copied ${copiedCount} images to public folder`);
} else {
  console.log('\n⚠️ Source images folder not found. Creating placeholder images...');
  
  // Create a simple placeholder image using a data URI
  const placeholderHtml = `
<!DOCTYPE html>
<html>
<body>
  <h1>Placeholder Image</h1>
  <p>Please add actual images to: frontend/src/assets/images/category/</p>
</body>
</html>
  `;
  
  categories.forEach(cat => {
    const indexPath = path.join(destDir, cat, 'index.html');
    fs.writeFileSync(indexPath, placeholderHtml);
  });
  
  // Create a simple placeholder.jpg
  const placeholderTxt = path.join(destDir, 'placeholder.txt');
  fs.writeFileSync(placeholderTxt, 'Placeholder image - please add actual images');
  
  console.log('✅ Created placeholder structure');
}

console.log('\n✅ Image migration complete!');