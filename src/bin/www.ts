#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('app:server');
var http = require('http');
//var https = require('https');


/**
 * Get port from environment and store in Express.
 */
var portnum =  process.env.PORT || '3333';
var argPort = process.argv[2];
if (argPort && argPort == parseInt(argPort).toString()){
  portnum = parseInt(argPort);
}

var port = normalizePort(portnum);
console.log("start rest server on "+port);
app.set('port', port);

/**
 * Create HTTP server.
 */

// let keyFile = process.env.KEY_FILE;
// let certFile = process.env.CERT_FILE;
// if (keyFile && certFile){
//   var options = {
//     key: fs.readFileSync(keyFile),
//     cert: fs.readFileSync(certFile)
//   };
// }


var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
