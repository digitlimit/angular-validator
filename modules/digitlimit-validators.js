/**
 * Super powerful and easy to use Angular Validator v1.0.0
 * http://digitlimit.com/packages/angular/validator
 *
 * If you are tired of writing numerous angular error message directives this
 * is for you.
 *
 * angular-validator.js
 * Copyright 2016 Mbah Emeka
 *
 * Date: 2016-03-27 6:48PM
 */

(function() {
    var $;
    $ = angular.element;
    angular.module('digitlimit.validators',[])
        .service('validators', ['$http', 'validatorStatus', function($http, validatorStatus) {
            var validators = {};

            /**
             * The field under validation must be yes, on, or 1. This is useful for validating “Terms of Service” acceptance.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * accepted: {
             *      message: 'Read and accept our terms and conditions'
                },
             */
            validators.accepted = function( value, param, element, ngModel) {
                return value == true || value.toLowerCase() == 'yes';
            };

            /**
             * The field under validation must be a valid URL
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * active_url: {
             *      url: http://yahoo.com
                    message: 'URL provided seems not active'
                },
             */
            validators.active_url = function( value, param, element, ngModel ) {

            };

            /**
             * Date must be after provided date
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * after: {
             *      date: 2000/10/10
                    message: 'Date provided must be before'
                },
             */
            validators.after = function( value, param, element, ngModel ) {
                return new Date(value) > new Date(param.date);
            };

            /**
             * The field under validation can contain only alphabets
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * alpha: {
                    message: 'Username can contain alphabets'
                },
             */
            validators.alpha = function( value, param, element, ngModel ) {
                return /^[a-zA-Z]*$/.test(value);
            };

            /**
             * The field under validation can contain dash
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * alpha_dash: {
                    message: 'Username can contain dash (-)'
                },
             */
            validators.alpha_dash  = function( value, param, element, ngModel ) {
                return /^[-\a-zA-Z]+$/.test(value);
            };

            /**
             * The field under validation can only be name
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * alpha_noun: {
                    message: 'First name can have space'
                },
             */
            validators.alpha_noun  = function( value, param, element, ngModel ) {
                return /^(?:[A-Za-z\' -]+(?:\s+|$)){1,4}$/.test(value);
            };

            /**
             * The field under validation can be a long text
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * alpha_text: {
                    message: 'First name can have space'
                },
             */
            validators.alpha_text  = function( value, param, element, ngModel ) {
                return /^(?:\\d+ [a-zA-Z ]+, ){2}[a-zA-Z ]+$/.test(value);
            };

            /**
             * The field under validation must be entirely alpha-numeric characters.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * alpha_num: {
                    message: 'Username must be an alpha numeric'
                },
             */
            validators.alpha_num = function( value, param, element, ngModel ) {
                return /^[a-z0-9]+$/i.test(value);
            };

            /**
             * Date must not be before provided date
             * @param value
             * @param element
             * @param
             * param
             * @returns {boolean} true for success | false for failure
             * @usage
             * before: {
             *      date: 2000/30/12
                    message: 'Age must be before 2000/30/12'
                },
             */
            validators.before = function( value, param, element, ngModel ) {
                return new Date(value) < new Date(param.date);
            };

            /**
             * Field must be between max and min
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * between: {
             *      max: 10
             *      min: 20
                    message: 'Must not be less than 10 or more than 20'
                },
             */
            validators.between = function( value, param, element, ngModel ) {
                var min = parseFloat(param[0]),
                    max = parseFloat(param[1]);

                if(typeof value == 'object' && value.size != undefined){
                    return value.size <= min || value.size >= min;
                };

                return  (value <= min || value >= max);
            };

            /**
             * The field under validation must have a matching field of foo_confirmation. For example, if the
             * field under validation is password, a matching password_confirmation field must be present in the
             * input.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * confirmed: {
             *      field: 'pass_confirm'
                    message: 'Kindly confirm password above'
                },
             */
            validators.confirmed = function( value, param, element, ngModel ) {
                var confirm = element.find('input[name="'+param.field+'"]');
                return confirm.val() == value;
            };

            /**
             *The field under validation must be a valid date
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * date: {
                    message: 'Invalid Date'
                },
             */
            validators.date = function( value, param, element, ngModel ) {
                return !/Invalid|NaN/.test(new Date(value).toString());
            };

            /**
             *The given field must be different than the field under validation
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * date_format: {
             *  format: 'YYYY-MM-DD'
                    message: 'date format must be in format YYYY-MM-DD'
                },
             */
            validators.date_format = function( value, param, element, ngModel ){

                var format = param.format;

                if (!(value && format)) return false;

                var splitter = format.match(/\-|\/|\s/) || ['-']
                    ,df       = format.split(splitter[0])
                    ,ds       = value.split(splitter[0])
                    ,ymd      = [0,0,0]
                    ,dat;
                for (var i=0;i<df.length;i++){
                    if (/yyyy/i.test(df[i])) {ymd[0] = ds[i];}
                    else if (/mm/i.test(df[i]))   {ymd[1] = ds[i];}
                    else if (/dd/i.test(df[i]))   {ymd[2] = ds[i];}
                }
                dat = new Date(ymd.join('/'));
                return !isNaN(dat) && Number(ymd[1])<=12 && dat.getDate()===Number(ymd[2]);
            };

            /**
             *The given field must be different than the field under validation
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * different: {
             *  field: 'password'
                message: 'Username must different from password'
                },
             */
            validators.different = function( value, param, element, ngModel ) {
                var field_name    = param.field,
                    form          = element.parent().parent(),
                    form_group    = element.parent(),
                    different = $(this).find('input[name="'+field_name+'"]');
                return different.val() != value;
            };

            /**
             *The field under validation must be formatted as an e-mail address.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * email: {
                message: 'Invalid email'
                },
             */
            validators.email = function( value, param, element, ngModel  ) {
                return  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
            };

            /**
             * Server side validation to ensure this field is exists
             * @param value
             * @param element
             * @param param
             * @usage
             * exists: {
             *  ajaxAsynchronous: true,
             *  url: http://localhost/app/verifier,
             *  beforeRequest: function(){
             *      //determine what happens before request
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  onSuccess: function(){
             *      //determine what happens on success
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  onFailure: function(){
             *      //determine what happens on failure
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  onComplete: function(){
             *      //determine what happens on request complete
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  custom: function(){
             *      //make a complete request and handle everything yourself. total control
             *  },
                message: 'File size must be exactly 20k'
               }
             */
            validators.exists = function( value, param, element, ngModel ){
                //return true;
            };

            /**
             *The file under validation must be an image (jpeg, png, bmp, or gif
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * image: {
                message: 'please choose an image'
                },
             */
            validators.image = function( value, param, element, ngModel ) {
                return value.type.match(/^image\//);
            };

            /**
             *The field under validation must be included in the given list of values.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * in: {
             *  lists: 'food,oil,cash'
                message: 'This value is not on the list'
                },
             */
            validators.in = function( value, param, element, ngModel ) {
                var lists = param.lists;
                lists = lists.toLowerCase().split(",");
                return ($.inArray(value, lists) == -1 ) ? false : true;
            };

            /**
             *The field under validation must have an integer value.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * integer: {
                message: 'Must be an integer'
                },
             */
            validators.integer = function( value, param, element, ngModel ) {
                //alert('value:'+value+', element:'+element+', param:'+param);
                return /^[0-9]*$/.test( value );
            };

            /**
             *The field under validation must be formatted as an IP address.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * ip: {
                message: 'Invalid IP address'
                },
             */
            validators.ip = function( value, param, element, ngModel ) {
                return /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/.test(value);
            };

            /**
             *
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * luhn: {
                message: ''
                },
             */
            //luhn : function( value, param, element, ngModel ){
            //    value = value.replace(/[^\d]/g, '');
            //    var sum = 0, parity = value.length % 2;
            //    for(i = 0; i < value.length; i++) {
            //        var digit = parseInt(value.charAt(i))
            //        if(i % 2 == parity) digit *= 2;
            //        if(digit > 9) digit -= 9;
            //        sum += digit;
            //    }
            //    return (sum % 10) == 0 && !isNaN(parseInt(value));
            //},


            /**
             * The field under validation must be less than a maximum value. Strings, numerics, and files are
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * max: {
             *  max: 20
                message: 'Username must not be more than 20 characters long'
                },
             */
            validators.max = function( value, param, element, ngModel ) {
                var min = param[0]; //expects min:11,numeric

                if(typeof value == 'object' && value.size != undefined){
                    return value.size <= min ? true : false;
                };

                return value != " " && (value.length <= min) ? true : false;
            };

            /**
             * The field under validation must have a minimum value
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * min: {
             *  min: 6
                message: 'Password must be not longer than 6 characters'
                },
             */
            validators.min = function(value, param, element, ngModel) {

                var min = param[0]; //expects min:11,numeric

                if(typeof value == 'object' && value.size != undefined){
                    return value.size >= min ? true : false;
                };

                return value != " " && (value.length >= min) ? true : false;
            };

            /**
             * The file under validation must have a MIME type corresponding to one of the listed extensions.
             * NB: we are just checking file extension here :). do  the real thing on server-side
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * mimes: {
             *  types: 'audio', application/pdf'
                message: 'Only jpg,gif is allowed'
                },
             */
            validators.mimes = function( value, param, element, ngModel ) {
                if(typeof value != 'object') return true;

                var types = param;
                var type = value.type;

                //known mimes
                var mims = {
                    'application/docx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                };

                return types.indexOf(type) > -1;
            };

            /**
             * The field under validation must not be included in the given list of values.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * not_in: {
             *  lists: 'fish,onions,tomatoes'
                message: 'The value you provided is not on the list'
                },
             */
            validators.not_in = function( value, param, element, ngModel ) {
                var lists = param.list;
                lists = lists.toLowerCase().split(",");
                return ($.inArray(value, lists) != -1 ) ? false : true;
            };

            /**
             * The field under validation must have a numeric value.
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * numeric: {
                message: 'The field must be a number'
                },
             */
            validators.numeric = function( value, param, element, ngModel ) {
                return !isNaN(value);
            };

            /**
             * The field under validation must match the given regular expression
             * @param value
             * @param element
             * @param param
             * @returns {boolean} true for success | false for failure
             * @usage
             * regex: {
                pattern: /^[a-zA-Z0-9]+$/,
                message: 'The username can only consist of alphabetical and number'
                },
             */
            validators.regex = function( value, param, element, ngModel ) {
                var pattern = param.pattern;
                //return pattern.test( value );
                return new RegExp(pattern).test(value);
            };

            /**
             * The field under validation must be present in the input data.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage:
             * required: {
                message: 'The username is required and cannot be empty'
               }
             */
            validators.required = function( value, param, element, ngModel ) {

                //if(element.is("input[type='checkbox']")){
                //    return element.is(":checked");
                //}else if(element.is("input[type='radio']")){
                //    return element.is(":checked");
                ////
                //console.log(form['name'].$viewValue);

                //value = value.trim();
                return (value && value.length != 0) && value != "";
            };

            /**
             * The field under validation must be present if the field field is equal to value.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage:
             * required_if: {
             *  field:subscribe
             *  value:yes
                message: 'The full name is required and cannot be empty'
               }
             */
            validators.required_if = function( value, param, element, ngModel ) {
                var field_name = param.field,
                    field = $(this).find('input[name="'+field_name+'"]');

                return (value.length == 0 && value == "") && (field.val() == param.value) ? false : true;
            };

            /**
             * The field under validation must be present only if the other specified fields are present.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage:
             * required_with: {
             *  fields: 'country,state,sex'
                message: 'The username is required and cannot be empty'
               }
             */
            validators.required_with = function( value, param, element, ngModel ) {
                var flag = false,
                    failed_fields = [],
                    fields = param.fields,
                    fields = fields.toLowerCase().split(",");

                $.each(fields, function(index, field_name){
                    var field       = $(this).find('input[name="'+field_name+'"]'),
                        field_value = field.val();

                    if( (field_value.length == 0 && field_value == "") ){
                        flag = true;
                        failed_fields[field_name] = field_name;
                    }
                });

                return (flag  && (value.length == 0 || value == "")) ? false : true;
            };

            /**
             * The field under validation must be present only when the other specified fields are not present.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage:
             * required_without: {
             *  fields: 'country,state,sex'
                message: 'This field is not applicable'
               }
             */
            validators.required_without = function( value, param, element, ngModel ) {
                //inverse of require with
                return !$(this).validateFunction('required_with', value, param, element, ngModel);
            };

            /**
             * The given field must match the field under validation.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage:
             * same: {
             *  field: 'phone'
                message: 'The work Phone must be same with Phone'
               }
             */
            validators.same = function( value, param, element, ngModel ) {
                var field_name = param.field,
                    field = $(this).find('input[name="'+field_name+'"]');

                return field.val() == value;
            };

            /**
             * The field under validation must have a size matching the given value. For string data, value
             * corresponds to the number of characters. For numeric data, value corresponds to a given integer
             * value. For files, size corresponds to the file size in kilobytes.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage:
             * size: {
             *  size: 20
                message: 'File size must be exactly 20k'
               }
             */
            validators.size = function( value, param, element, ngModel ) {

                if(typeof value == 'object' && value.size != undefined){
                    return param == value.size;
                };

                return value.length == param
            };

            /**
             * Server side validation to ensure this field is unique
             * @param value
             * @param element
             * @param param
             * @usage
             * unique: {
             *  ajaxAsynchronous: true,
             *  url: http://localhost/app/verifier,
             *  beforeRequest: function(){
             *      //determine what happens before request
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  onSuccess: function(){
             *      //determine what happens on success
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  onFailure: function(){
             *      //determine what happens on failure
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  onComplete: function(){
             *      //determine what happens on request complete
             *      //NB: onFailure will not run if custom callback exists
             *  },
             *  custom: function(){
             *      //make a complete request and handle everything yourself. total control
             *  },
                message: 'File size must be exactly 20k'
               }
             */
            validators.unique = function(value, param, element, ngModel, ctrls, config) {

                if(!angular.isObject(param) || angular.isUndefined(param['url'])) return false;

                var url = param['url'];
                var data = {};
                var name = ngModel.$name;
                data[name] = value;

                $http({
                    method: 'POST',
                    url: url,
                    data: data
                }).then(function(response){
                        var valid;
                        var message;
                        var rule = 'unique';
                        var attr = {name:name};

                        if(!angular.isUndefined(response['data'])){
                            valid = response['data']['valid'];
                            message = response['data']['message'];
                        }else{
                            valid = response['valid'];
                            message = response['message'];
                        }

                        if(!valid)
                        {
                            validatorStatus.error(element, attr, rule, param, config);
                            ngModel.$setValidity(rule, false, ctrls);
                            return false; //terminates validation once a rule fails
                        }else{
                            validatorStatus.success(element, attr, rule, param, config);
                            ngModel.$setValidity(rule, true, ctrls);
                        }

                        if(angular.isFunction(param['success'])) param['success'](response);
                        return response;
                    },
                    function(error)
                    {
                        validatorStatus.reset(element);
                        if(angular.isFunction(param['error'])) param['error']();
                        return false;
                    });

                return 2;
            };

            /**
             * The field under validation must be formatted as an URL.
             * @param value
             * @param element
             * @param param
             * @returns {boolean}
             * @usage
             * url: {
                message: 'Kindly provide a valid URL'
               }
             */
            validators.url = function( value, param, element, ngModel ) {
                return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            };

            return validators;
        }]);

}).call(this);