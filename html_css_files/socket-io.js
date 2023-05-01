const socketio = require('socket.io');
module.exports.io = (server) => {
   const io = socketio(server);
   io.on('connection', async function (socket, next) {
   });

   return io;
};