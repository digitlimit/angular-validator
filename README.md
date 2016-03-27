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

    <form validator>
       <div class="form-group">
           <input type="text" ng-model="first_name" name="first_name">
       </div>
       <div class="form-group">
           <input type="text" ng-model="last_name" name="last_name">
       </div>
       <div class="form-group">
           <input type="text" ng-model="email" name="email">
       </div>
       <div class="form-group">
           <input type="password" ng-model="password" name="password">
       </div>
       <div class="form-group">
           <input type="text" ng-model="country" name="country">
       </div>
    </form>


### Available validator rules
###### accepted
The field under validation must be yes, on, 1, or true. This is useful for validating "Terms of Service" acceptance.

###### active_url
The field under validation must be a valid URL according to the checkdnsrr PHP function.

###### after:date
The field under validation must be a value after a given date. The dates will be passed into the strtotime:

    start_date':required|date|after:tomorrow'
Instead of passing a date string to be evaluated by strtotime, you may specify another field to compare against the date:

    finish_date :'required|date|after:start_date'

###### alpha
The field under validation must be entirely alphabetic characters.

###### alpha_dash
The field under validation may have alpha-numeric characters, as well as dashes and underscores.

###### alpha_num
The field under validation must be entirely alpha-numeric characters.

###### array
The field under validation must be a PHP array.

###### before:date
The field under validation must be a value preceding the given date. The dates will be passed into the PHP strtotime function.

###### between:min,max
The field under validation must have a size between the given min and max. Strings, numerics, and files are evaluated in the same fashion as the size rule.

###### boolean
The field under validation must be able to be cast as a boolean. Accepted input are true, false, 1, 0, "1", and "0".

###### confirmed
The field under validation must have a matching field of foo_confirmation. For example, if the field under validation is password, a matching password_confirmation field must be present in the input.

###### date
The field under validation must be a valid date according to the strtotime PHP function.

###### date_format:format
The field under validation must match the given format. The format will be evaluated using the PHP date_parse_from_format function. You should use either date or date_format when validating a field, not both.

###### different:field
The field under validation must have a different value than field.

###### digits:value
The field under validation must be numeric and must have an exact length of value.

###### digits_between:min,max
The field under validation must have a length between the given min and max.

###### email
The field under validation must be formatted as an e-mail address.

###### exists:table,column
The field under validation must exist on a given database table.

Basic Usage Of Exists Rule
'state' => 'exists:states'
Specifying A Custom Column Name

'state' => 'exists:states,abbreviation'
You may also specify more conditions that will be added as "where" clauses to the query:

'email' => 'exists:staff,email,account_id,1'
You may also pass NULL or NOT_NULL to the "where" clause:

'email' => 'exists:staff,email,deleted_at,NULL'

'email' => 'exists:staff,email,deleted_at,NOT_NULL'

###### image
The file under validation must be an image (jpeg, png, bmp, gif, or svg)

###### in:foo,bar,...
The field under validation must be included in the given list of values.

###### integer
The field under validation must be an integer.

###### ip
The field under validation must be an IP address.

###### json
The field under validation must be a valid JSON string.

###### max:value
The field under validation must be less than or equal to a maximum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.

###### mimes:foo,bar,...
The file under validation must have a MIME type corresponding to one of the listed extensions.

Basic Usage Of MIME Rule

'photo' => 'mimes:jpeg,bmp,png'
Even though you only need to specify the extensions, this rule actually validates against the MIME type of the file by reading the file's contents and guessing its MIME type.

A full listing of MIME types and their corresponding extensions may be found at the following location: http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types

###### min:value
The field under validation must have a minimum value. Strings, numerics, and files are evaluated in the same fashion as the size rule.

###### not_in:foo,bar,...
The field under validation must not be included in the given list of values.

###### numeric
The field under validation must be numeric.

###### reflex:pattern
The field under validation must match the given regular expression.

Note: When using the regex pattern, it may be necessary to specify rules in an array instead of using pipe delimiters, especially if the regular expression contains a pipe character.

###### required
The field under validation must be present in the input data and not empty. A field is considered "empty" is one of the following conditions are true:

The value is null.
The value is an empty string.
The value is an empty array or empty Countable object.
The value is an uploaded file with no path.

###### required_if:anotherfield,value,...
The field under validation must be present if the anotherfield field is equal to any value.

###### required_unless:anotherfield,value,...
The field under validation must be present unless the anotherfield field is equal to any value.

###### required_with:foo,bar,...
The field under validation must be present only if any of the other specified fields are present.

###### required_with_all:foo,bar,...
The field under validation must be present only if all of the other specified fields are present.

###### required_without:foo,bar,...
The field under validation must be present only when any of the other specified fields are not present.

###### required_without_all:foo,bar,...
The field under validation must be present only when all of the other specified fields are not present.

###### same:field
The given field must match the field under validation.

###### size:value
The field under validation must have a size matching the given value. For string data, value corresponds to the number of characters. For numeric data, value corresponds to a given integer value. For files, size corresponds to the file size in kilobytes.

###### string
The field under validation must be a string.

###### timezone
The field under validation must be a valid timezone identifier according to the timezone_identifiers_list PHP function.

###### unique
The field under validation must be unique on a given database table. If the column option is not specified, the field name will be used.

Specifying A Custom Column Name:

'email' => 'unique:users,email_address'
Custom Database Connection

Occasionally, you may need to set a custom connection for database queries made by the Validator. As seen above, setting unique:users as a validation rule will use the default database connection to query the database. To override this, specify the connection followed by the table name using "dot" syntax:

'email' => 'unique:connection.users,email_address'
Forcing A Unique Rule To Ignore A Given ID:

Sometimes, you may wish to ignore a given ID during the unique check. For example, consider an "update profile" screen that includes the user's name, e-mail address, and location. Of course, you will want to verify that the e-mail address is unique. However, if the user only changes the name field and not the e-mail field, you do not want a validation error to be thrown because the user is already the owner of the e-mail address. You only want to throw a validation error if the user provides an e-mail address that is already used by a different user. To tell the unique rule to ignore the user's ID, you may pass the ID as the third parameter:

'email' => 'unique:users,email_address,'.$user->id
If your table uses a primary key column name other than id, you may specify it as the fourth parameter:

'email' => 'unique:users,email_address,'.$user->id.',user_id'
Adding Additional Where Clauses:

You may also specify more conditions that will be added as "where" clauses to the query:

'email' => 'unique:users,email_address,NULL,id,account_id,1'
In the rule above, only rows with an account_id of 1 would be included in the unique check.


###### url
The field under validation must be a valid URL according to PHP's filter_var function.


### NB: Mist of the Validator rules above are not yet available and will be updated soon.
Inspired by Laravel the rules documentation is lifted from Laravel.com as applicable to this module. Documentation ongoing 
