const client = require('../common/client');
const KoaRouter = require('koa-router');

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
