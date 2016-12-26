var io = require('socket.io-client');

const locally = true;
if (locally){
  var socket = io('http://localhost');
} else {
  var socket = io('http://ttt-server.herokuapp.com');
}

module.exports = socket;
