/** @module template
 */
module.exports = {
  render: render,
  loadDir: loadDir
}

var fs = require('fs');
var path = require('path');
var templates = {};

/** @function loadDir
  * Loads a directory of templates
  * @param {string} directory - the directory to load
  */
function loadDir(directory) {
  var dir = fs.readdirSync(directory);
  dir.forEach(function(file) {
    var path = directory + '/' + file;
    var stats = fs.statSync(path);
    if(stats.isFile()) {
      templates[file] = fs.readFileSync(path).toString();
    }
  });
}

/** @function render
  * Renders a template with embedded javascript
  * @param {string} templateName - the template to render
  * @param {...}
  */
function render(templateName, context) {
  var templatePath = path.join(__dirname, '/templates/' + templateName + '.html');
  return templates[templateName].replace(/<%=(.+)%>/g, function(match, js) {
    return eval("var context = " + JSON.stringify(context) + ";" + js);
  });
  return html;
}
