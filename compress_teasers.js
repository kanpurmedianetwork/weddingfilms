const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const SOURCE_DIR = 'C:\\Users\\offic\\Desktop\\WEBSITE\\teaser';
const TARGET_DIR = path.join(__dirname, 'public', 'assets', 'teasers');

const TEASERS = [
  {
    src: 'teaser .mp4',
    name: 'teaser_1'
  },
  {
    src: 'teaser m4v.m4v',
    name: 'teaser_2'
  },
  {
    src: 'teaser .ms4.mp4',
    name: 'teaser_3'
  }
];

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args);
    
    proc.stderr.on('data', (data) => {
      const str = data.toString();
      if (str.includes('frame=')) {
        process.stdout.write(str.substring(str.indexOf('frame='), str.indexOf('frame=') + 40) + '\r');
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });
  });
}

async function main() {
  for (const teaser of TEASERS) {
    const srcPath = path.join(SOURCE_DIR, teaser.src);
    const destFullMP4 = path.join(TARGET_DIR, `${teaser.name}.mp4`);
    const destPreviewMP4 = path.join(TARGET_DIR, `${teaser.name}_preview.mp4`);
    const destPreviewWebM = path.join(TARGET_DIR, `${teaser.name}_preview.webm`);

    console.log(`\n--------------------------------------------------`);
    console.log(`Processing: ${teaser.src}`);
    console.log(`--------------------------------------------------`);

    if (!fs.existsSync(srcPath)) {
      console.error(`Source file not found: ${srcPath}`);
      continue;
    }

    // 1. Compress Full Length Video (720p, high compression, progressive stream)
    console.log(`Compressing Full Video -> ${teaser.name}.mp4`);
    try {
      await runFFmpeg([
        '-y',
        '-i', srcPath,
        '-vf', 'scale=1280:-2',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '26',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        destFullMP4
      ]);
      const stats = fs.statSync(destFullMP4);
      console.log(`\n  Success! Full Video Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (e) {
      console.error(`\n  Failed to compress full video:`, e.message);
    }

    // 2. Compress 10-Second Preview Loop (MP4, silent, 640px)
    console.log(`Compressing 10s Preview MP4 -> ${teaser.name}_preview.mp4`);
    try {
      await runFFmpeg([
        '-y',
        '-i', srcPath,
        '-t', '10',
        '-vf', 'scale=640:-2',
        '-r', '24',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '28',
        '-an',
        destPreviewMP4
      ]);
      const stats = fs.statSync(destPreviewMP4);
      console.log(`\n  Success! Preview MP4 Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (e) {
      console.error(`\n  Failed to compress preview MP4:`, e.message);
    }

    // 3. Compress 10-Second Preview Loop (WebM, silent, 640px)
    console.log(`Compressing 10s Preview WebM -> ${teaser.name}_preview.webm`);
    try {
      await runFFmpeg([
        '-y',
        '-i', srcPath,
        '-t', '10',
        '-vf', 'scale=640:-2',
        '-r', '24',
        '-c:v', 'libvpx-vp9',
        '-b:v', '0',
        '-crf', '38',
        '-cpu-used', '2',
        '-an',
        destPreviewWebM
      ]);
      const stats = fs.statSync(destPreviewWebM);
      console.log(`\n  Success! Preview WebM Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch (e) {
      console.error(`\n  Failed to compress preview WebM:`, e.message);
    }
  }

  console.log('\nAll teaser compressions complete!');
}

main();
