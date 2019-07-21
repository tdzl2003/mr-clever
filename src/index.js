const { autoRelease, waitForExitSignal } = require('./common/autoRelease');
const app = require('./app');

function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(process.env['PORT'] || 8000, resolve);
    server.on('error', reject);
    autoRelease(() => server.close());
    resolve(server);
  });
}

async function main() {
  await startServer();
  waitForExitSignal();
}

main().catch(e => {
  setTimeout(() => {
    throw e;
  });
});
