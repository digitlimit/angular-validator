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
                        //makes a POST request by default
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
            },

            //success callback runs if validation succeeds
            success: function(form){
                //validation succeeded you can then send to server
                //its your duty toensure there is a second validation 
                //on server before saving     
            },

            //optionally do other things if validation failed
            error: function(errors) {
               //alert('opps correct errors on form');
            },
             
            //You can optionally add custom error messages to override defaults
            messages: {
                email:{
                    required: 'We need your email address',
                    unique: 'You email is taken dude :)'
                },
                first_name: {
                    required: 'we need your first name'
                }
            }
        }
    }]);,
#### Add Validator directive to your Twitter Bootstrap form and that's all!!!

    <form novalidate validate-form name="form" role="form">
       <div class="form-group">
           <input type="text" class="form-control" ng-model="first_name" name="first_name">
       </div>
       <div class="form-group">
           <input type="text" class="form-control" ng-model="last_name" name="last_name">
       </div>
       <div class="form-group">
           <input type="text" class="form-control" ng-model="email" name="email">
       </div>
       <div class="form-group">
           <input type="password" class="form-control" ng-model="password" name="password">
       </div>
       <div class="form-group">
           <input type="text" class="form-control" ng-model="country" name="country">
       </div>
    </form>


### Available validator rules
