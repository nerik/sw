import { execSync } from 'child_process';

const inputImage = 'export.png';

// Input image dimensions
const width = 2054;
const height = 6151;

// Output settings
const fps = 30;
const scrollDuration = 54;
const pauseTop = 4;
const pauseBottom = 4;
const totalDuration = pauseTop + scrollDuration + pauseBottom;

// Derived values
const fullCropHeight = 1080;
const fullScrollRange = height - fullCropHeight;

const mobileWidth = width; // 2054
const mobileHeight = 1920;
const mobileScrollRange = height - mobileHeight;
const mobileXOffset = 0; // no cropping on X

// Filenames
const outputFull = 'scroll_full_hd.mp4';
const outputMobile = 'scroll_mobile.mp4';

function runFFmpeg(command, label) {
  try {
    console.log(`✨ Generating ${label}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${label} done.\n`);
  } catch (err) {
    console.error(`❌ Failed to create ${label} video.`);
    console.error(err.message);
    process.exit(1);
  }
}

// --- Full HD Scroll ---
const cmdFull = `
ffmpeg \
-loop 1 -t ${pauseTop} -i ${inputImage} \
-loop 1 -t ${scrollDuration} -i ${inputImage} \
-loop 1 -t ${pauseBottom} -i ${inputImage} \
-filter_complex "
[0:v]crop=${width}:${fullCropHeight}:0:0,setsar=1[v0];
[1:v]crop=${width}:${fullCropHeight}:0:'${fullScrollRange}*t/${scrollDuration}',setsar=1[v1];
[2:v]crop=${width}:${fullCropHeight}:0:${fullScrollRange},fade=t=out:st=3:d=1:alpha=0,setsar=1[v2];
[v0][v1][v2]concat=n=3:v=1:a=0[out]" \
-map "[out]" -r ${fps} -c:v libx264 -crf 18 -preset slow -profile:v high -pix_fmt yuv420p -y ${outputFull}
`;

runFFmpeg(cmdFull, 'Full HD Scroll');


// --- Mobile Portrait Scroll ---
const cmdMobile = `
ffmpeg \
-loop 1 -t ${pauseTop} -i ${inputImage} \
-loop 1 -t ${scrollDuration} -i ${inputImage} \
-loop 1 -t ${pauseBottom} -i ${inputImage} \
-filter_complex "
[0:v]crop=${mobileWidth}:${mobileHeight}:${mobileXOffset}:0,setsar=1[v0];
[1:v]crop=${mobileWidth}:${mobileHeight}:${mobileXOffset}:'${mobileScrollRange}*t/${scrollDuration}',setsar=1[v1];
[2:v]crop=${mobileWidth}:${mobileHeight}:${mobileXOffset}:${mobileScrollRange},fade=t=out:st=3:d=1:alpha=0,setsar=1[v2];
[v0][v1][v2]concat=n=3:v=1:a=0[out]" \
-map "[out]" -r ${fps} -c:v libx264 -crf 18 -preset slow -profile:v high -pix_fmt yuv420p -y ${outputMobile}
`;

runFFmpeg(cmdMobile, 'Mobile Portrait Scroll');

const addAudio = (inputVideo, outputVideo, audioFile) => {
  const command = `
    ffmpeg -i ${inputVideo} -i ${audioFile} \
    -map 0:v -map 1:a \
    -c:v copy -t 60 -shortest \
    -c:a aac -b:a 192k -y ${outputVideo}
  `;

  runFFmpeg(command, `Add audio to ${outputVideo}`);
};

// Add audio to both outputs
addAudio(outputFull, 'scroll_full_hd_with_audio.mp4', 'music.mp3');
addAudio(outputMobile, 'scroll_mobile_with_audio.mp4', 'music.mp3');