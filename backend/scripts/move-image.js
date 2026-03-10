const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../frontend/src/assets/images');
const destDir = path.join(__dirname, '../frontend/public/images');

// Create destination directories
const categories = ['wooden', 'acrylic', 'metal', 'gifts', 'mementos', 'marble'];

categories.forEach(cat => {
  const destPath = path.join(destDir, cat);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }
});

// Copy images if they exist
if (fs.existsSync(sourceDir)) {
  categories.forEach(cat => {
    const sourceCat = path.join(sourceDir, cat);
    const destCat = path.join(destDir, cat);
    
    if (fs.existsSync(sourceCat)) {
      const files = fs.readdirSync(sourceCat);
      files.forEach(file => {
        const sourceFile = path.join(sourceCat, file);
        const destFile = path.join(destCat, file);
        if (fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, destFile);
          console.log(`✅ Copied: ${file}`);
        }
      });
    }
  });
  console.log('\n✅ All images moved to public folder');
} else {
  console.log('⚠️ Source images folder not found at:', sourceDir);
  
  // Create placeholder files
  categories.forEach(cat => {
    const destCat = path.join(destDir, cat);
    if (!fs.existsSync(destCat)) {
      fs.mkdirSync(destCat, { recursive: true });
    }
    
    // Create a simple placeholder text file
    const placeholderFile = path.join(destCat, 'placeholder.txt');
    fs.writeFileSync(placeholderFile, `Placeholder for ${cat} images - Add actual images here`);
  });
  console.log('✅ Placeholder structure created');
}