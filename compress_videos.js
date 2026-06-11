const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
console.log('Assets Directory:', assetsDir);

// Define original input files
const desktopInput = path.join(assetsDir, 'hero_video_desktop.mp4');
const mobileInput = path.join(assetsDir, 'hero_video_mobile.mp4');

// Define optimized output files
const desktopOutputMP4 = path.join(assetsDir, 'hero_video_desktop_optimized.mp4');
const desktopOutputWebM = path.join(assetsDir, 'hero_video_desktop_optimized.webm');

const mobileOutputMP4 = path.join(assetsDir, 'hero_video_mobile_optimized.mp4');
const mobileOutputWebM = path.join(assetsDir, 'hero_video_mobile_optimized.webm');

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    console.log(`Running FFmpeg with args: ${args.join(' ')}`);
    const proc = spawn(ffmpegPath, args);
    
    proc.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    proc.stderr.on('data', (data) => {
      const str = data.toString();
      if (str.includes('frame=')) {
        process.stdout.write(str.substring(str.indexOf('frame='), str.indexOf('frame=') + 50) + '\r');
      }
    });

    proc.on('close', (code) => {
      console.log(`\nFFmpeg process exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg failed with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    // 1. Compress Desktop Video (MP4)
    if (fs.existsSync(desktopInput)) {
      console.log('\n--- Compressing Desktop Video (MP4) ---');
      await runFFmpeg([
        '-y',
        '-i', desktopInput,
        '-t', '10',
        '-vf', 'scale=1920:-2',
        '-r', '24',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '24',
        '-an',
        desktopOutputMP4
      ]);
      console.log('Desktop MP4 compressed successfully!');

      console.log('\n--- Compressing Desktop Video (WebM) ---');
      await runFFmpeg([
        '-y',
        '-i', desktopInput,
        '-t', '10',
        '-vf', 'scale=1920:-2',
        '-r', '24',
        '-c:v', 'libvpx-vp9',
        '-b:v', '0',
        '-crf', '34',
        '-cpu-used', '2',
        '-an',
        desktopOutputWebM
      ]);
      console.log('Desktop WebM compressed successfully!');
    } else {
      console.log('Desktop input file not found:', desktopInput);
    }

    // 2. Compress Mobile Video (MP4)
    if (fs.existsSync(mobileInput)) {
      console.log('\n--- Compressing Mobile Video (MP4) ---');
      await runFFmpeg([
        '-y',
        '-i', mobileInput,
        '-t', '10',
        '-vf', 'scale=720:-2',
        '-r', '24',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '25',
        '-an',
        mobileOutputMP4
      ]);
      console.log('Mobile MP4 compressed successfully!');

      console.log('\n--- Compressing Mobile Video (WebM) ---');
      await runFFmpeg([
        '-y',
        '-i', mobileInput,
        '-t', '10',
        '-vf', 'scale=720:-2',
        '-r', '24',
        '-c:v', 'libvpx-vp9',
        '-b:v', '0',
        '-crf', '35',
        '-cpu-used', '2',
        '-an',
        mobileOutputWebM
      ]);
      console.log('Mobile WebM compressed successfully!');
    } else {
      console.log('Mobile input file not found:', mobileInput);
    }
    
    console.log('\nAll video compressions completed successfully!');
  } catch (err) {
    console.error('Error during video compression:', err);
  }
}

main();
