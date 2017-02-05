var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var app = express();
var MongoClient = mongodb.MongoClient;
var session = require("express-session");
app.use(express.static("."));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/images'));
app.use(bodyParser.json());
app.use(session({ secret: "sh", cookie: { maxAge: 5 * 60 * 1000 } }));
var sess;
var user;
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index2.html");
});

app.post("/deleteEvent", function(req, res){
   console.log("Server deleteEvent called.");
   console.log(req.body); 
   var eventID = req.body.eventID;
   console.log(eventID);
   var collection;
   MongoClient.connect("mongodb://localhost:27017/event_data", function(err,db){
       if(err){
           console.log("Unable to connect for delete."+err);
       } else {
           console.log("connected for delete.");
           collection = db.collection("event_data");
           collection.remove({"eventID":eventID}, function(error,record){
            //    if(!error){
            //        console.log(record);
                    res.send(record);
            //    }
           });
       }
   });
});

app.post("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            //res.redirect('/');
            res.send("Logged out.");
        }
    });
    //res.send("username set to NULL");

});

app.post("/login", function (req, res) {
    sess = req.session;
    var username = req.body.username;
    var pwd = req.body.pwd;
    //console.log(username, pwd);
    MongoClient.connect("mongodb://localhost:27017/user_data", function (err, db) {
        if (err) {
            console.log("Unable to connect for login.");
        } else {
            console.log("Connected for login verification.");
            collection = db.collection("user_data");
            collection.find({ "username": username, "password": pwd }).toArray(function (err, result) {
                if (err) {
                    console.log("Db error");
                    res.send(err);
                } else {
                    console.log(result);
                    console.log(result.length);
                    //console.log(result.body.username, result.body.passwprd);
                    if (result.length === 1) {
                        console.log("Login Successful.");
                        sess.user = result[0].username;
                        console.log(sess.user,result[0].username);
                        user = result[0].username;
                        console.log("Welcome " + user + "!!");
                        res.send(user);
                    } else {
                        console.log("Incorrect username or password.");
                        res.send("failure");
                    }

                    //res.send(result);
                }
            });
        }
    });
});

app.post("/getEvents", function (req, res) {
    sess=req.session;
    console.log(req.body);
    console.log("Ready to serve Data.");
    console.log(sess);
    var collection;
    if(sess.user){
        var loggedinUSer = req.body.username;
        var collection;
        MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to get Events.");
        } else {
            console.log("Connected to get Events.");
            collection = db.collection("event_data");
            collection.find({"addedBy":loggedinUSer}).toArray(function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    console.log("user data");
                    //console.log(result);
                    res.send(result);
                }
            });
        }
    });
        
    }else {
    MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to get Events.");
        } else {
            console.log("Connected to get Events.");
            collection = db.collection("event_data");
            collection.find({}).toArray(function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    console.log("all Data");
                    res.send(result);
                }
            });
        }
    });}
});

app.post("/registerUser", function (req, res) {
    var doc = req.body;
    console.log(doc);
    var collection;
    MongoClient.connect("mongodb://localhost:27017/user_data", function (err, db) {
        if (err) {
            console.log("Unable to connect.");
        } else {
            console.log("Connected to insert.");
            collection = db.collection("user_data");
            collection.insert(doc, { w: 1 }, function (err, record) {
                console.log(record);
                res.send(record.ops[0]);
            });
        }
    });
    //res.send("Data Recieved");
});

app.post("/createEvent", function (req, res) {
    var doc = req.body;
    console.log(user);
    //console.log(sess.user);
    doc.addedBy = user;
    console.log(doc);
    var collection;
    MongoClient.connect("mongodb://localhost:27017/event_data", function (err, db) {
        if (err) {
            console.log("Unable to connect.");
        } else {
            console.log("Connected to insert.");
            collection = db.collection("event_data");
            collection.insert(doc, { w: 1 }, function (err, record) {
                console.log(record);
                res.send(record.ops[0]);
            });
        }
    });
    //res.send("Data Recieved");
});
app.listen(5000, function () {
    console.log("Working on port 5000");
});