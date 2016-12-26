var io = require('socket.io-client');

const locally = false;
if (locally){
  var socket = io('http://localhost');
} else {
  var socket = io('http://ttt-server.herokuapp.com');
}

module.exports = socket;
