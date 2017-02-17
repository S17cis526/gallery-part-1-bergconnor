/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
"use strict;"

/* global variables */
var multipart = require('./multipart');
var template = require('./template');
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var port = 3000;

/* load cached files */
var config = JSON.parse(fs.readFileSync('config.json'));
var stylesheet = fs.readFileSync('gallery.css');

/* load tempaltes */
template.loadDir('templates');

/** @function getImageNames
 * Retrieves the filenames for all images in the
 * /images directory and supplies them to the callback.
 * @param {function} callback - function that takes an
 * error and array of filenames as parameters
 */
function getImageNames(callback) {
  fs.readdir('images/', function(err, fileNames){
    if(err) callback(err, undefined);
    else callback(false, fileNames);
  });
}

/** @function imageNamesToTags
 * Helper function that takes an array of image
 * filenames, and returns an array of HTML img
 * tags build using those names.
 * @param {string[]} filenames - the image filenames
 * @return {string[]} an array of HTML img tags
 */
function imageNamesToTags(fileNames) {
  return fileNames.map(function(fileName) {
    var href = fileName.slice(0, -4) + '.html';
    return `<a href="${href}"><img src="${fileName}" alt="${fileName}"></a>`;
  });
}

/**
 * @function buildGallery
 * A helper function to build an HTML string
 * of a gallery webpage.
 * @param {string[]} imageTags - the HTML for the individual
 * gallery images.
 */
function buildGallery(imageTags) {
  return template.render('gallery.html', {
    title: config.title,
    imageTags: imageNamesToTags(imageTags).join('')
  });
}

/** @function serveGallery
 * A function to serve a HTML page representing a
 * gallery of images.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function serveGallery(req, res) {
  getImageNames(function(err, imageNames){
    if(err) {
      console.error(err);
      res.statusCode = 500;
      res.statusMessage = 'Server error';
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(buildGallery(imageNames));
  });
}

/** @function serveImage
 * A function to serve an image file.
 * @param {string} filename - the filename of the image
 * to serve.
 * @param {http.incomingRequest} - the request object
 * @param {http.serverResponse} - the response object
 */
function serveImage(fileName, req, res) {
  fs.readFile('images/' + decodeURIComponent(fileName), function(err, data){
    if(err) {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = "Resource not found";
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'image/*');
    res.end(data);
  });
}

/** @function servePage
 * A function to serve an image file.
 * @param {string} filename - the filename of the html page
 * to serve.
 * @param {http.incomingRequest} - the request object
 * @param {http.serverResponse} - the response object
 */
function servePage(fileName, req, res) {
  fs.readFile('details/' + decodeURIComponent(fileName), function(err, data){
    if(err) {
      console.error(err);
      res.statusCode = 404;
      res.statusMessage = "Resource not found";
      res.end();
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(data);
  });
}

/** @function buildJSON
 * A function to generate a JSON file
 * containing metadata for an upload.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function buildHTML(req, res) {
  var filename = req.body.image.filename.slice(0, -4);
  var filePath = path.join(__dirname, '/metadata/' + filename + '.json');
  var details = JSON.parse(fs.readFileSync(filePath));
  // var html =  `<!DOCTYPE html>`;
  //     html += `<html>`;
  //     html += `  <head>`;
  //     html += `    <title>Gallery</title>`;
  //     html += `  </head>`;
  //     html += `  <body>`;
  //     html += `    <img src="${details.image}" alt="${details.image}">`;
  //     html += `    <h1>${details  .city + details.name}</h1>`;
  //     html += `  </body>`;
  //     html += `</html>`;
  var html = template.render('details.html', {
    city: details.city,
    name: details.name,
    image: details.image
  })
  filename = filename + '.html';
  fs.writeFile('details/' + filename, html, function(err){
    if(err) {
      console.error(err);
      res.statusCode = 500;
      res.statusMessage = "Server Error";
      res.end("Server Error");
      return;
    }
  });
}

/** @function buildJSON
 * A function to generate a JSON file
 * containing metadata for an upload.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function buildJSON(req, res) {
  var json = {
    'city' : req.body.city,
    'name' : req.body.name,
    'image': req.body.image.filename
  };
  var filename = req.body.image.filename.slice(0, -4) + '.json';
  json = JSON.stringify(json, null, ' ');
  fs.writeFileSync('metadata/' + filename, json);
}

/** @function handleUpload
 * A function to process an http POST request
 * containing an image and text fields.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function handleUpload(req, res) {
  multipart(req, res, function(req, res) {
    // make sure an image was uploaded
    if(!req.body.image.filename) {
      console.error("No file in upload");
      res.statusCode = 400;
      res.statusMessage = "No file specified"
      res.end("No file specified");
      return;
    }
    fs.writeFile('images/' + req.body.image.filename, req.body.image.data, function(err) {
      if(err) {
        console.error(err);
        res.statusCode = 500;
        res.statusMessage = "Server Error";
        res.end("Server Error");
        return;
      }
      serveGallery(req, res);
    });
    buildJSON(req, res);
    buildHTML(req, res);
  });
}

/** @function handleRequest
 * A function to determine what to do with
 * incoming http requests.
 * @param {http.incomingRequest} req - the incoming request object
 * @param {http.serverResponse} res - the response object
 */
function handleRequest(req, res) {
  // at most, the url should have two parts -
  // a resource and a querystring separated by a ?
  var urlParts = url.parse(req.url);

  if(urlParts.query) {
    var matches = /title=(.+)($|&)/.exec(urlParts.query);
    if(matches && matches[1]){
      config.title = decodeURIComponent(matches[1]);
      fs.writeFile('config.json', JSON.stringify(config));
    }
  }

  switch(urlParts.pathname) {
    case '/':
    case '/gallery':
      if(req.method == 'GET') {
        serveGallery(req, res);
      } else if(req.method == 'POST') {
        handleUpload(req, res);
      }
      break;
    case '/gallery.css':
      res.setHeader('Content-Type', 'text/css');
      res.end(stylesheet);
      break;
    default:
      var extension = req.url.substring(req.url.lastIndexOf('.') + 1);
      if(extension == 'jpg') {
        serveImage(req.url, req, res);
      } else {
          servePage(req.url, req, res);
      }
  }
}

/* Create and launch the webserver */
var server = http.createServer(handleRequest);
server.listen(port, function(){
  console.log("Server is listening on port ", port);
});
