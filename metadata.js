/** @module metadata
 */
module.exports = {
  buildJSON: buildJSON,
  buildHTML: buildHTML
}

var template = require('./template');
var fs = require('fs');
var path = require('path');

/** @function buildJSON
 * A function to generate a JSON file
 * containing metadata for an upload.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function buildJSON(req, res) {
  var json = {
    'city'        : req.body.city,
    'name'        : req.body.name,
    'description' : req.body.description,
    'image'       : '../images/' + req.body.image.filename
  };
  var filename = req.body.image.filename.slice(0, -4) + '.json';
  json = JSON.stringify(json, null, ' ');
  fs.writeFileSync('metadata/' + filename, json);
}

/** @function buildHTML
 * A function to generate an html file
 * containing to display an upload's metadata.
 * @param {http.incomingRequest} req - the request object
 * @param {http.serverResponse} res - the response object
 */
function buildHTML(req, res) {
  var filename = req.body.image.filename.slice(0, -4);
  var filePath = path.join(__dirname, '/metadata/' + filename + '.json');
  var details = JSON.parse(fs.readFileSync(filePath));
  var html = template.render('details.html', {
    city        : details.city,
    name        : details.name,
    description : details.description,
    image       : details.image
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
