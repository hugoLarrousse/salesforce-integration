const io = require('socket.io-client');

const { socketServer, socketSecure = false } = process.env;
console.log('process.env', process.env.socketServer);

const socket = io.connect(socketServer, { secure: socketSecure });

exports.sendInfoSync = (data) => {
  socket.emit('fromSalesforceInfoSync', data);
};
