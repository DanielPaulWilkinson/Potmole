//Aquire All Packages
var express = require('express');
var path = require('path');
var bodyParsers = require('body-parser');
var multer = require('multer');
var sqlite3 = require('sqlite3')
	.verbose();
var fs = require('fs');
//state destination of any uplaod file
var upload = multer({
		dest: 'uploads/'
	});
	//create an express app
var app = express();
//create a database
var db = new sqlite3.Database('potholes');
//use body parcer to be able to read JSON content
app.use(bodyParsers.json());
var allowCrossDomain = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', "*");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	};
	//make user our app uses this function
app.use(allowCrossDomain);
//create database with  record for testing
db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS potholes (Id INTEGER PRIMARY KEY AUTOINCREMENT,Latitude INTEGER, Longitude INTEGER, Comment TEXT, Title TEXT, User TEXT, PotStatus TEXT,IMG_File_Name TEXT)");
	db.run("INSERT INTO potholes (Latitude,Longitude,Comment,Title,User,PotStatus,IMG_File_Name) VALUES (?,?,?,?,?,?,?)", 1.0, 1.0, "This is a huge pothole just next to macdonalds", "Pothole!", "Dan",
		"Notified", "2b994f3bb0434637607cfd78fa7222a5");
});
//create a JWT secret
var secret = process.env.JWT_SECRET || "I_Am_The_Best_Programmer"; // super secret
//Endpoint that alows me delete a user by the prameter.
app.delete('/auth/:id', function(req, res) {
	var ReportToDelete = req.params.id;
	db.run("DELETE FROM potholes WHERE Id = ?", ReportToDelete, function(err) {
		res.send((err === null) ? {
			msg: ''
		} : {
			msg: 'error: ' + err
		});
	});
});
//Endpoint that alows me to update a user by the prameter.
app.post('/auth/update/:id', function(req, res) {
	var ReportToUpdate = req.params.id;
	db.run("UPDATE potholes SET Latitude='" + req.body.Latitude + "' ,Longitude='" + req.body.Longitude + "',Comment='" + req.body.Comment + "',Title='" + req.body.Title + "',User='" + req.body.User +
		"',PotStatus='" + req.body.PotStatus + "' WHERE Id = '" + ReportToUpdate + "'", function(err) {
			res.send((err === null) ? {
				msg: ''
			} : {
				msg: 'error: ' + err
			});
		});
});
// selects potholes for admin view
app.get('/auth', function(req, res) {
	db.all("SELECT * FROM potholes", function(err, rows) {
		res.jsonp(rows);
	});
});
//ensables us to add potholes to the map index page
app.get('/', function(req, res) {
	db.all("SELECT * FROM potholes", function(err, rows) {
		res.jsonp(rows);
	});
});
//=================================Image upload Exteded feature==========================================
//firstly recive the posted file and make sure we can store this file in the uploads folder
app.post('/insert-file', multer({
		dest: './uploads/'
	})
	.single('upload'),
	//create a request and responce after this action has been carried out
	function(req, res) {
		//to be able to store the image strait in the database i am simply going to strigify this image into a base69 string
		var b69 = new Buffer(fs.readFileSync(req.file.path))
			.toString("base64");
		//from here i will carry out a basic insert into potholes table
		db.run("INSERT INTO potholes (Latitude,Longitude,Comment,Title,User,PotStatus,IMG_File_Name) VALUES (?,?,?,?,?,?,?)", req.body.Latitude, req.body.Longitude, req.body.Comment, req.body.Title, req.body
			.User, req.body.PotStatus, b69, function(err) {
				//if error
				if (err) {
					//send a responce with the error
					res.send((err === null) ? {
						msg: ''
					} : {
						msg: 'error: ' + err
					});
				}
				else {
					//if all is fine. end.
				}
			});
	});
console.log("We have a working API");
app.listen(3000);
