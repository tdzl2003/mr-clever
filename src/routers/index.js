const client = require('../common/client');
const KoaRouter = require('koa-router');
const cp = require('child_process');
var ffmpeg = require('fluent-ffmpeg');

const router = new KoaRouter();
module.exports = router;

router.get('/list', async ctx => {
  ctx.result = await client.listDevices();
});

router.get('/:serial/screen', async ctx => {
  const { serial } = ctx.params;
  ctx.set('Content-Type', 'image/png');
  ctx.body = await client.screencap(serial);
});

router.get('/:serial/live', async ctx => {
  console.log(ctx.method);
  const { serial } = ctx.params;
  ctx.set('Content-Type', 'video/mp4');

  const subprocess = cp.spawn(
    'adb',
    ['-s', serial, 'exec-out', 'screenrecord', '--output-format=h264', '-'],
    {
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  );

  ctx.req.on('close', () => {
    subprocess.kill('SIGTERM');
  });

  ctx.body = ffmpeg(subprocess.stdout)
    .inputFormat('h264')
    .outputOptions('-c:v', 'copy')
    .outputOptions('-movflags', 'frag_keyframe+faststart')
    .outputFormat('mp4')
    .on('error', () => {})
    .pipe()
    .on('error', () => {});
});

router.get('/:serial/live.html', async ctx => {
  const { serial } = ctx.params;
  ctx.set('Content-Type', 'text/html');
  ctx.body = `
  <html>
    <head>
    </head>
    <body>
    <video preload="none" controls>
      <source src="/api/${serial}/live" type="video/mp4">
    </video>
    </body>
  </html>`;
});

// const subprocess = cp.spawn(
//   'adb',
//   ['exec-out', 'screenrecord', '--output-format=h264', '-'],
//   {
//     stdio: ['ignore', 'pipe', 'ignore'],
//   },
// );

// const playProcess = cp.spawn(
//   'mplayer',
//   '-framedrop -fps 60 -cache 32 -demuxer h264es -'.split(' '),
//   {
//     stdio: ['pipe', 'inherit', 'inherit'],
//   },
// );

// subprocess.stdout.pipe(playProcess.stdin);
