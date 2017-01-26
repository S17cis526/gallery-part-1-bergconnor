"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
var http = require('http');
var fs = require('fs');
var port = 3000;

function serveImage(filename, req, res) {
  fs.readFile('images/' + filename, function(err, body) {
    if(err) {
      console.error(err);
      res.statusCode = 500;
      res.statusMessage = "whoops";
      res.end("Silly me");
      return;
    }
    res.setHeader("Content-Type", "image/jpeg");
    res.end(body);
  });
}

var server = http.createServer(function(req,res) {

  switch(req.url) {
    case "/ace":
    case "/ace/":
    case "/ace.jpg":
    case "/ace.jpeg":
        serveImage('ace.jpg', req, res);
        break;
    case "/bubble":
    case "/bubble/":
    case "/bubble.jpg":
    case "/bubble.jpeg":
        serveImage('bubble.jpg', req, res);
        break;
    case "/chess":
    case "/chess/":
    case "/chess.jpg":
    case "/chess.jpeg":
      serveImage('chess.jpg', req, res);
      break;
    case "/fern":
    case "/fern/":
    case "/fern.jpg":
    case "/fern.jpeg":
        serveImage('fern.jpg', req, res);
        break;
    case "/mobile":
    case "/mobile/":
    case "/mobile.jpg":
    case "/mobile.jpeg":
        serveImage('mobile.jpg', req, res);
        break;
    default:
      res.statusCode = 404;
      res.statusMessage = "Not found";
      res.end();
      break;
  }
});

server.listen(port, function() {
  console.log("Listening on Port " + port);
});
