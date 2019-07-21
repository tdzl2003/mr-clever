const release = [];

function autoRelease(func) {
  release.push(func);
}
exports.autoRelease = autoRelease;

async function releaseAll() {
  while (release.length > 0) {
    await release.pop()();
  }
}
exports.releaseAll = releaseAll;

function waitForExitSignal(debug = console.log) {
  return new Promise(resolve => {
    async function stopServer() {
      process.removeListener('SIGINT', stopServer);
      process.removeListener('SIGTERM', stopServer);
      process.removeListener('SIGHUP', stopServer);

      debug('Shutting down...');
      // stop timer & wakeup listener
      await releaseAll();
      debug('Bye.');
      resolve();
    }
    process.on('SIGINT', stopServer);
    process.on('SIGTERM', stopServer);
    process.on('SIGHUP', stopServer);

    // Waiting for signal:
    debug('Ready.');
  });
}
exports.waitForExitSignal = waitForExitSignal;
