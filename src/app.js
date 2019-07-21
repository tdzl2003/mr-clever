const Koa = require('koa');
const KoaBody = require('koa-bodyparser');
const KoaRouter = require('koa-router');
const app = new Koa();

app.proxy = true;
app.use(KoaBody());
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.result && !ctx.body) {
      ctx.body = {
        ok: 1,
        data: ctx.result,
      };
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e.stack);
    }
    ctx.body = {
      code: e.code || -1,
      message: e.message,
      now: Date.now(),
    };
  }
});

const router = new KoaRouter();
router.use('/api', require('./routers').routes());

app.use(router.routes());
app.use(ctx => {
  ctx.status = 404;
  ctx.body = 'Not Found';
});
module.exports = app;
