# angular-validator
Super powerful and easy to use Angular Validator
Inspired by Laravel Validator. 


## How to use this module

#### Add Validator to your angular module as a depency like so:

    var myapp = angular.module('myapp',
        ['digitlimit.validator']);

#### Setup Validator rules in your controller:

    myapp.controller('MyCtrl', ['$scope',
    function($scope){
        $scope.validators = {

            rules: {
                first_name: 'required|min:5',
                last_name: 'required|min:5',
                email: ['required','email', {
                    unique: {
                        url: 'http://yoursite.com/validate/unque/email',
                        //sucess callback is optional
                        success: function(response){
                           //stuffs here if need be. Example hide a loader
                           //eg $scope.loadinImage = false;
                        },
                        //error callback is optional
                        error: function(error){
                            console.log(error);
                        }
               
                    }    
                }],
                password: 'required|min:6',
                country: ['required', 'max:80']
            }

        }
    }]);
