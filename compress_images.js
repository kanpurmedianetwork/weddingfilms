const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const SOURCE_DIR = 'C:\\Users\\offic\\Desktop\\WEBSITE';
const TARGET_DIR = path.join(__dirname, 'public', 'assets', 'gallery');

const CATEGORIES = ['ENG', 'HALDI', 'MEHNDI', 'PREWEDDING', 'WEDDING'];
const IMAGES_PER_CATEGORY = 15; // Max options to see

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

CATEGORIES.forEach(category => {
  const srcCatDir = path.join(SOURCE_DIR, category);
  const targetCatDir = path.join(TARGET_DIR, category.toLowerCase());

  if (!fs.existsSync(targetCatDir)) {
    fs.mkdirSync(targetCatDir, { recursive: true });
  }

  console.log(`Processing category: ${category}`);

  if (!fs.existsSync(srcCatDir)) {
    console.error(`Source directory does not exist: ${srcCatDir}`);
    return;
  }

  // Read files in source directory
  const files = fs.readdirSync(srcCatDir);
  const imageFiles = files.filter(file => {
    // Exclude Apple double files and system files
    if (file.startsWith('._') || file.startsWith('.')) return false;
    const ext = path.extname(file).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  });

  console.log(`Found ${imageFiles.length} images in ${category}. Selecting up to ${IMAGES_PER_CATEGORY}.`);

  // Take the first IMAGES_PER_CATEGORY files
  const selectedFiles = imageFiles.slice(0, IMAGES_PER_CATEGORY);

  selectedFiles.forEach((file, index) => {
    const srcFilePath = path.join(srcCatDir, file);
    const destFileName = `${category.toLowerCase()}_${index + 1}.webp`;
    const destFilePath = path.join(targetCatDir, destFileName);

    console.log(`Compressing ${file} -> ${destFileName}`);

    try {
      // ffmpeg command to scale width to 1200px (preserving aspect ratio) and convert to optimized webp
      const cmd = `"${ffmpegPath}" -y -i "${srcFilePath}" -vf "scale=1200:-1" -c:v libwebp -quality 75 "${destFilePath}"`;
      execSync(cmd, { stdio: 'ignore' });
      const stats = fs.statSync(destFilePath);
      console.log(`  Success! Size: ${(stats.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`  Failed to compress ${file}:`, err.message);
    }
  });
});

console.log('All image processing complete!');
