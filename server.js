// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var path = require('path');
    // configuration =================
    var db = mongoose.connection;
    mongoose.connect('mongodb://localhost:27017/pdms');     // connect to mongoDB database on modulus.io

    
    app.use(express.static(path.join(__dirname, 'public')));
                // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

// Single Page Application
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/public/pages/index.html'));
});

// Patients schemas and models here.
var Patient;
db.on('error', console.error);
db.once('open', function() {
    var userSchema = new mongoose.Schema({
       "FirstName" : String,
        "LastName" : String,
        "DateOfBirth" : String,
        "Gender" : String,
        "Notes" : String
    }, { collection : 'records' });
    
    
// Patients schemas and models here.    
var notesSchema = new mongoose.Schema({
        "Patient_id" : String,
        "Title" : String,
        "Notes" : String
    }, { collection : 'notes' });
 Patient = mongoose.model('Patient', userSchema);
 Notes = mongoose.model('Notes', notesSchema);
});




// api to handle data ======================================================================

//apis for patient data
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // get all patients
    app.get('/api/patients', function(req, res) {

        // use mongoose to get all patients in the database
        Patient.find(function(err, patients) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(patients); // return all patients in JSON format
        });
    });

    


// delete a patient
    app.delete('/api/patients/:patient_id', function(req, res) {
        Patient.remove({
            _id : req.params.patient_id
        }, function(err, patient) {
            if (err)
                res.send(err);
             Notes.remove({
                "Patient_id" : req.params.patient_id
                }, function(err, patient) {
                    if (err)
                        res.send(err);
   
            // get and return all the todos after you create another
                    Patient.find(function(err, patients) {
                        if (err)
                            res.send(err)
                        res.json(patients);
                    });
            });
        });
    });

// create patient and send back all patients after creation
    app.post('/api/patients/create', function(req, res) {

        // create a patient, information comes from AJAX request from Angular
        Patient.create({
            "FirstName" : req.body.FirstName,
            "LastName" : req.body.LastName,
            "DateOfBirth" : req.body.DateOfBirth,
            "Gender" : req.body.Gender,
            done : false
        }, function(err, patient) {
            if (err)
                res.send(err);
            Notes.create({
                "Patient_id" : req.body._id,
                "Title" : req.body.FirstName,
                "Notes" : req.body.Notes,
            done : false
            }, function(err, patient) {
                if (err)
                    res.send(err);
                Patient.find(function(err, patients) {
                    if (err)
                        res.send(err)
                    res.json(patients);
                });
            });
        });

    });

//update patient information
   app.put('/api/patients/update/', function(req, res) {
       Patient.update( { _id: req.body._id }, 
                                 { $set: 
                                  {"FirstName" : req.body.FirstName,
                                    "LastName" : req.body.LastName,
                                    "DateOfBirth" : req.body.DateOfBirth,
                                    "Gender" : req.body.Gender}}, function (err, patient) {
                                        if (err) 
                                            res.send(err)
                                        Patient.find(function(err, patients) {
                                            if (err)
                                                res.send(err)
                                            res.json(patients);
                                        });
                                });

   });


//apis for notes data
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//add a notes for one patient
    app.post('/api/patients/notes/create/', function(req, res) {

            Notes.create({
                "Patient_id" : req.body._id,
                "Title" : req.body.Title,
                "Notes" : req.body.Notes,
            done : false
            }, function(err, patient) {
                if (err)
                    res.send(err);
                Notes.find({"Patient_id": req.body._id },function(err, notes) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(notes); // return all patients in JSON format
        });
            });

    });



//delete a notes for one patient   
  app.delete('/api/patients/notes/:notes_id', function(req, res) {
        Notes.remove({
            _id : req.params.notes_id
        }, function(err, notes) {
            if (err)
                res.send(err);
            
        });
    });



//get all notes for one patient
 app.get('/api/patient/notes/:patient_id', function(req, res) {

        // use mongoose to get all patients in the database
        Notes.find({"Patient_id": req.params.patient_id },function(err, notes) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(notes); // return all patients in JSON format
        });
    });
