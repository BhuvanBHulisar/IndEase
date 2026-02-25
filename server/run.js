process.on('uncaughtException', (err) => {
    require('fs').writeFileSync('async_error.txt', err.stack || err.toString());
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    require('fs').writeFileSync('async_error.txt', reason ? (reason.stack || reason.toString()) : 'Unhandled rejection');
    process.exit(1);
});
require('./index.js');
