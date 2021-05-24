const io = require('socket.io-client');
const config = require('config');

const socketInfo = config.get('socket');

const socket = io.connect(socketInfo.url);

exports.sendInfoSync = (data) => {
  socket.emit('fromSalesforceInfoSync', data);
};
