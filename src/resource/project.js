"use strict";

/** @module project
* A RESTful resource representing a software project
* implementing the CRUD methods.
*/
module.exports = {
  list: list,
  create: create,
  read: read,
  update: update,
  destroy: destroy
}

/** @function list
* Sends a list of all projects as a JSON array.
*/
function list(req, res, db) {
 db.all("SELECT * FROM teams", [], function(err, teams) {
   if(err) {
     console.error(err);
     res.statusCode = 500;
     res.end("Server error");
   }
   res.setHeader("Content-Type", "text/json");
   res.end(JSON.stringify(teams));
 });
}

/** @function create
* Inserts a new team in the database.
*/
function create(req, res, db) {
 var body = "";

 req.on("error", function(err) {
   console.error(err);
   res.statusCode = 500;
   res.end("Server error");
 });

 req.on("data", function(data) {
   body += data;
 });

 req.on("end", function() {
   var team = JSON.parse(body);
   db.run("INSERT INTO teams (city, name, description) VALUES (?, ?, ?)",
     [team.city, team.name, team.description],
     function(err) {
       if(err) {
         console.error(err);
         res.statusCode = 500;
         res.end("Could not insert team into database");
         return;
       }
       res.statusCode = 200;
       res.end();
     });
 });
}

/** @function read
* Serves a specific team as a JSON string.
*/
function read(req, res, db) {
 var id = req.params.id;
 db.get("SELECT * FROM teams WHERE id=?", [id], function(err, team) {
   if(err) {
     console.error(err);
     res.statusCode = 500;
     res.end("Server error");
     return;
   }
   if(!team) {
     res.statusCode = 404;
     res.end("Team not found");
     return;
   }
   res.setHeader("Content-Type", "text/json");
   res.end(JSON.stringify(project));
 });
}

/** @function update
* Updates a specific team with the form values.
*/
function update(req, res, db) {
 var body = "";

 req.on("error", function(err) {
   console.error(err);
   res.statusCode = 500;
   res.end("Server error");
 });

 req.on("data", function(data) {
   body += data;
 });

 req.on("end", function() {
   var team = JSON.parse(body);
   db.run("UPDATE teams (name=?, description=?, version=?, repository=?, license=?) WHERE id=?",
     [team.city, team.name, team.description, id],
     function(er) {
       if(err) {
         console.error(err);
         res.statusCode = 500;
         res.end("Could not update team in database");
         return;
       }
       res.statusCode = 200;
       res.end();
     });
 });
}

/** @function destroy
* Removes the specified team from the database.
*/
function destroy(req, res, db) {
 var id = req.params.id;
 db.run("DELETE FROM teams WHERE id=?", [id], function(err) {
   if(err) {
     console.error(err);
     res.statusCode = 500;
     res.end("Server error");
   }
   res.statusCode = 200;
   res.end();
 });
}
