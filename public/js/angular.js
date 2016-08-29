var app = angular.module("PDMS", ['ngRoute','ngMaterial','ngMessages']);

var data;

app.controller("mainController", function ($scope, $filter, $mdComponentRegistry, $mdDialog, $http) {
    
// get all patients on loading page
    $http.get("/api/patients").success(function(response) {
        $scope.patientData = response;
        });
//initialise scope variables     
        $scope.createPatient = false;
        $scope.class = "close-detail";
        $scope.user = {"FirstName":"","LastName":"","DateOfBirth":"","Gender":""};
        $scope.notesList = [];
        $scope.userNotes = {"_id":"","Title":"","Notes":""};

// change sort methods by selected item in dropdown box
        $scope.change = function(){
            $scope.reverse = ($scope.sortmethod == "DateOfBirth");
        };
/////////////////////////////////////////////////////////////
// control of detail of patient.
// this section can be used for creating and editing patients.
//////////////////////////////////////////////////////////////
    
// create a new patient 
        $scope.create = function(ev) {
            $scope.details = true;
            $scope.createPatient = true;
        };

// close this section.
        $scope.close = function(ev) {
            $scope.userNotes = {};
            $scope.userNotes = {};
            $scope.user = {};
            $scope.class = "close-detail";
            $scope.details = false;
            $scope.notesDetails = "";
            $scope.notesList = [];
        };
  
// add notes for current patient
        $scope.addNotes = function(){
            $scope.userNotes._id = $scope.user._id;
            today = new Date();
            $scope.userNotes.Title = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
            console.log($scope.userNotes);
            $http.post("/api/patients/notes/create/", $scope.userNotes)
                .success(function(data) {
                     $scope.notesList = data;
                })
                .error(function(error)
                {
                    alert('error') ;
                });
        };
    
// delete selected notes.    
        $scope.deleteNotes = function(id) {
            console.log();
                    $http.delete('/api/patients/notes/' + id)
                    .success(function(data) {
                       $http.get("/api/patient/notes/" + $scope.user._id).success(function(response) {
                        $scope.notesList = response;
                    });
             
                        
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
                };
    
// confirm the information.
// it can be used for both creating and updating data.
    
         $scope.submitForm = function() {
             
             // creating a new patient.
             if ($scope.createPatient == true){
                 $http.post("/api/patients/create/", $scope.user)
                .success(function(data) {
                    $scope.patientData = data;
                    
                })
                .error(function(error)
                {
                    alert('error') ;
                });
                 $http.get("/api/patient/notes/" + $scope.user._id).success(function(response) {
                        $scope.notesList = response;
                    });
             }
             else{
            // updating information for current patient.
                 $http.put('/api/patients/update/', $scope.user)
                    .success(function(data) {
                        $scope.patientData = data;
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
             }
            
             $scope.user = {};
             $scope.userNotes = {};
             $scope.class = "close-detail";
             $scope.details = false;
             $scope.notesDetails = "";
            $scope.notesList = [];
         };

// delete selected patient
        $scope.delete = function(id) {
                    $http.delete('/api/patients/' + id)
                    .success(function(data) {
                        $scope.patientData = data;
                        
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
                };

// edit information for selected patient
        $scope.edit = function(item) {
                    $scope.createPatient = false;
                    $scope.user = item;
                    $scope.user["DateOfBirth"] = new Date($scope.user["DateOfBirth"]);
                            
                    $http.get("/api/patient/notes/" + $scope.user._id).success(function(response) {
                        $scope.notesList = response;
                    });
            
                    $scope.details = true;
          
                };
    
// show details of selected notes
       $scope.showDetails = function(index){
           $scope.notesDetails = $scope.notesList[index].Notes;
           $scope.class = "open-detail";
       };
// hide details of notes.       
       $scope.closeDetails = function(index){
           $scope.notesDetails = "";
           $scope.class = "close-detail";
       };
    
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
// filter results by a date of birth range.
       $scope.dateRangeFilter = function (property, startDate,      endDate) {
            return function (item) {
                if (item[property] == null) return false;
                
                var itemDate = $filter('date')(item[property], "yyyy-MM-dd");
                var s = (startDate != null) ? $filter('date')(startDate, "yyyy-MM-dd"):$filter('date')("0000-00-00", "yyyy-MM-dd"); 
                var e = (endDate != null) ? $filter('date')(endDate, "yyyy-MM-dd"):$filter('date')((new Date), "yyyy-MM-dd"); 
                if (itemDate >= s && itemDate <= e) return true;
                return false;
    }
}



});

// configure routes for application
app.config(function($routeProvider) {
    $routeProvider

        // route for the results page
        .when('/', {
            templateUrl : 'pages/results.html',
            controller  : 'mainController'
        })

});