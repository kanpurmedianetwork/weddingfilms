const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

const teaserDir = 'C:\\Users\\offic\\Desktop\\WEBSITE\\teaser';
const files = ['teaser .mp4', 'Teaser 2.mp4', 'teaser .ms4.mp4', 'teaser m4v.m4v'];

files.forEach(f => {
  const p = path.join(teaserDir, f);
  const cmd = `"${ffmpegPath}" -i "${p}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    const err = e.stderr ? e.stderr.toString() : e.message;
    const lines = err.split('\n');
    const durLine = lines.find(l => l.includes('Duration'));
    const streamLine = lines.find(l => l.includes('Stream #0:0') && l.includes('Video'));
    console.log(`${f}:`);
    console.log(`  ${durLine ? durLine.trim() : 'No duration info'}`);
    console.log(`  ${streamLine ? streamLine.trim() : 'No video stream info'}`);
  }
});
