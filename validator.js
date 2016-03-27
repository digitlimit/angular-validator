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
    angular.module('digitlimit.validator',
        [
            'digitlimit.validators',
            'digitlimit.validator.messages',
            'digitlimit.validator.status'
        ])
        .service('Validator', ['validators', 'validatorStatus', function(validators, validatorStatus) {

            var services = {};
            var _this = this;

            _this.result = [];

            _this.ruleParams = function(rule){

                var params;

                if(angular.isObject(rule)){
                    var ruleObj = Object.keys(rule); //{unique:{params}}
                    var ruleKey = ruleObj[0];

                    params = rule[ruleKey];
                    rule = ruleKey;

                }else if(rule.indexOf(':') > -1 ){
                    var ruleParam  = rule.split(":");
                    rule = ruleParam[0];

                    //example unique:user,name
                    params = ruleParam[1];
                    params = params && params.indexOf(',') > -1 ? params.split(",") : [params];
                }else{
                    return null;
                }

                return {rule:rule, params:params}
            };

            _this.splitRule = function(rule){
                return (typeof rule === 'string') ? rule.split("|") : rule;
            };

            _this.validationFunction = function(validator, value, params, element, ngModel, ctrls, config) {
                if(!(validator in validators)) throw "Validator '"+validator+"' does not exists";
                return validators[validator](value, params, element, ngModel, ctrls, config);
            };

            _this.expandRules = function(rules){
                if(typeof rules != 'object'){
                    console.error('validator rules must be an array of rules');
                    return;
                }
                angular.forEach(rules, function(rule, modelName)
                {
                    rule = (typeof rule === 'string') ? rule.split("|") : rule;
                });
            };

            services.validate = function(value, rules, element, ngModel, attr, ctrls, config){
                rules = _this.splitRule(rules);
                var errors = [];
                for (var i = 0, len = rules.length; i < len; i++)
                {
                    var rule = rules[i];
                    var ruleParams = _this.ruleParams(rule);
                    var params = null;
                    if (ruleParams)
                    {
                        rule = ruleParams['rule'];
                        params = ruleParams['params'];
                    }

                    var validation = _this.validationFunction(rule, value, params, element, ngModel, ctrls, config);

                    if (!validation)
                    {
                        errors.push(rule);
                        validatorStatus.error(element, attr, rule, params, config);
                        ngModel.$setValidity(rule, false, ctrls);

                        return false; //terminates validation once a rule fails
                    }else{
                        //check if server side action is in progress
                        //validation will have '2' is there is an ongoing server side validation
                        if(validation == 2) {
                            validatorStatus.pending(element, attr, rule, params, config);
                        }else{
                            validatorStatus.success(element, attr, rule, params, config);
                            ngModel.$setValidity(rule, true, ctrls);
                        }
                    }
                }
                return true;
            };
            return services;
        }])
        .directive('validateForm',['Validator', '$compile',
            function(Validator, $compile)
            {
                return {
                    restrict: 'A',
                    require: ['^form'],
                    link: {
                        pre: function(scope, element, attrs, ctrls){
                            var form = ctrls[0];
                            var config = scope.validator;
                            if(typeof config != 'object') return;

                            element.find('select, input, textarea').attr('validate-field','');
                            $compile(element.contents())(scope);

                            element.on('submit', function() {
                                var rules = config['rules'];
                                var errors = [];

                                angular.forEach(rules, function (field_rule, modelName) {
                                    var ngModel = form[modelName];
                                    var elem = angular.element(document.getElementsByName(modelName));
                                    var attributes = elem[0];
                                    var attrs = {}; //id:'', name:'', placeholder:''

                                    attrs['id'] = attributes.getAttribute('id');
                                    attrs['name'] = attributes.getAttribute('name');
                                    attrs['placeholder'] = attributes.getAttribute('placeholder');
                                    attrs['class'] = attributes.getAttribute('class');

                                    var value = ngModel.$modelValue;
                                    if (attrs['type'] == 'file') value = elem.files[0];
                                    var valid = Validator.validate(value, field_rule, elem, ngModel, attrs, ctrls, config);

                                    //record an error
                                    if (!valid) errors.push(modelName);

                                    ngModel.$dirty = true;
                                    scope.$apply();
                                });

                                if (errors.length){
                                    //error
                                    if (config['error'] != undefined) config['error'](errors);
                                }else{
                                    //success
                                    if (config['success'] != undefined) config['success'](form);
                                }
                            });
                        }
                    }
                };
            }

        ])
        .directive('validateField',['Validator',
            function(Validator)
            {
                return{
                    restrict: 'A',
                    require: ['^ngModel'],
                    link: function(scope, element, attr, ctrls){
                        var ngModel = ctrls[0];
                        var config = scope.validator;

                        if(typeof config != 'object' ||
                            config['rules'] == undefined ||
                            config['rules'][ngModel.$name] == undefined) return;

                        var rules = config['rules'][ngModel.$name];

                        element.on('blur', function(){
                            var value = ngModel.$modelValue;
                            if(attr['type'] == 'file') value = this.files[0];
                            Validator.validate(value, rules, element, ngModel, attr, ctrls, config);
                            ngModel.$dirty = true;
                            scope.$apply();
                        });

                        if(attr['type'] == 'file'){
                            element.bind('change', function(){

                                var file = this.files[0];
                                var reader = new FileReader();

                                var fg = element.parent();
                                var preview = fg.find('img-preview');

                                reader.onload = function (evt) {
                                    scope.$apply(function(scope){
                                        scope.myImage=evt.target.result;;
                                    });
                                };
                                reader.readAsDataURL(file);

                                scope.$apply(function(){
                                    ngModel.$dirty = true;
                                    ngModel.$setViewValue(element.val());
                                    ngModel.$render();
                                });
                            });
                        }
                    }
                }
            }]);
}).call(this);

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

(function() {
    var $;
    $ = angular.element;
    angular.module('digitlimit.validator.messages',[])
        .service('validatorMessages', ['$http', function($http) {

            var messages = {
                "accepted"             : "The :attribute must be accepted.",
                "active_url"           : "The :attribute is not a valid URL.",
                "after"                : "The :attribute must be a date after :date.",
                "alpha"                : "The :attribute may only contain letters.",
                "alpha_dash"           : "The :attribute may only contain letters, numbers, and dashes.",
                "alpha_num"            : "The :attribute may only contain letters and numbers.",
                "alpha_noun"           : "The :attribute may only contain spaces, letters and numbers.",
                "alpha_text"           : "The :attribute may only contain spaces, letters and numbers.",
                "array"                : "The :attribute must be an array.",
                "before"               : "The :attribute must be a date before :date.",

                "not_in"               : "The selected :attribute is invalid.",
                "numeric"              : "The :attribute must be a number.",
                "regex"                : "The :attribute format is invalid.",
                "required"             : "The :attribute field is required.",
                "required_if"          : "The :attribute field is required when :other is :value.",
                "required_with"        : "The :attribute field is required when :values is present.",
                "required_with_all"    : "The :attribute field is required when :values is present.",
                "required_without"     : "The :attribute field is required when :values is not present.",
                "required_without_all" : "The :attribute field is required when none of :values are present.",
                "same"                 : "The :attribute and :other must match.",

                "boolean"              : "The :attribute field must be true or false.",
                "confirmed"            : "The :attribute confirmation does not match.",
                "date"                 : "The :attribute is not a valid date.",
                "date_format"          : "The :attribute does not match the format :format.",
                "different"            : "The :attribute and :other must be different.",
                "digits"               : "The :attribute must be :digits digits.",
                "digits_between"       : "The :attribute must be between :min and :max digits.",
                "email"                : "The :attribute must be a valid email address.",
                "filled"               : "The :attribute field is required.",
                "exists"               : "The selected :attribute is invalid.",
                "invalid"              : "The selected :attribute is invalid.",
                "image"                : "The :attribute must be an image.",
                "in"                   : "The selected :attribute is invalid.",
                "integer"              : "The :attribute must be an integer.",
                "ip"                   : "The :attribute must be a valid IP address.",

                "mimes"                : "The :attribute must be a file of type: :values.",

                "unique"               : "The :attribute has already been taken.",
                "url"                  : "The :attribute format is invalid.",
                "timezone"             : "The :attribute must be a valid zone.",

                "official_email"       : "The :attribute must be an official email.",
                "free_email"   		   : ":attribute must be from free email provider.",
                "not_free_email"       : ":attribute must not be from free email provider",
                "verified_email"       : "This :attribute does not exists.",

                "between"              : {
                    "numeric"          : "The :attribute must be between :min and :max.",
                    "file"             : "The :attribute must be between :min and :max kilobytes.",
                    "string"           : "The :attribute must be between :min and :max characters.",
                    "array"            : "The :attribute must have between :min and :max items."
                },

                "max"                  : {
                    "numeric"          : "The :attribute may not be greater than :max.",
                    "file"             : "The :attribute may not be greater than :max kilobytes.",
                    "string"           : "The :attribute may not be greater than :max characters.",
                    "array"            : "The :attribute may not have more than :max items."
                },

                "min"                  : {
                    "numeric"          : "The :attribute must be at least :min.",
                    "file"             : "The :attribute must be at least :min kilobytes.",
                    "string"           : "The :attribute must be at least :min characters.",
                    "array"            : "The :attribute must have at least :min items."
                },

                "size"                 : {
                    "numeric"          : "The :attribute must be :size.",
                    "file"             : "The :attribute must be :size kilobytes.",
                    "string"           : "The :attribute must be :size characters.",
                    "array"            : "The :attribute must contain :size items."
                }

            };

            return function(element, attrs, rule, param){

                //console.log(attrs);

                var name        = '',
                    field_name  = '',
                    error       = '';

                if(attrs.friendlyName != undefined){
                    field_name = attrs.friendlyName;
                }else{
                    name = attrs.name,
                    field_name  = name.replace(/_/g, " ");

                    //ucwords
                    field_name = field_name.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                        return letter.toUpperCase();
                    });
                }

                if(angular.isArray(param)){
                    var max = param[0];
                    var type = param[1] != undefined ? param[1] : 'numeric';
                }


                //special rules
                switch(rule)
                {
                    case 'after':
                        var date = param[0];
                        error = messages[rule].replace(/:date/g, date);
                        break;

                    case 'before':
                        var date = param[0];
                        error = messages[rule].replace(/:date/g, date);
                        break;

                    case 'same':
                        var other = param[0];
                        error = messages[rule].replace(/:other/g, other);
                        break;

                    case 'between':
                        var min = param[0];
                        var max = param[1];
                        var type = param[2] != undefined ? param[2] : 'numeric';
                        error = messages[rule][type].replace(/:min/g, min);
                        error = error.replace(/:max/g, max)
                        break;

                    case 'max':
                        var max = param[0];
                        error = messages[rule][type].replace(/:max/g, max);
                        break;

                    case 'min':
                        var min = param[0];
                        error = messages[rule][type].replace(/:min/g, min);
                        break;

                    case 'size':
                        var size = param[0];
                        error = messages[rule][type].replace(/:size/g, size);
                        break;

                    case 'mimes':
                        var types = '';

                        if(typeof param == 'object'){
                            //types = types.join(' or ' );
                            //remove
                            for(var i = 0,len = param.length; i < len; ++i){
                                type = param[i].split('/'); //e.g. image/jpg
                                types += type[1];
                                if(i < param.length - 1) types += ' or ';
                            }
                        }else{
                            types = param;
                        }
                        error = messages[rule].replace(/:values/g, types);
                        break;

                    default:
                        error = messages[rule];
                        break;
                }

                error = error.replace(/:attribute/g, field_name);
                return error;
            };

        }]);

}).call(this);

(function() {
    var $;
    $ = angular.element;
    angular.module('digitlimit.validator.status',[])
        .service('validatorStatus', ['validatorMessages', function(validatorMessages) {

            var field_error;
            var form_group;
            var icon;
            var icons = {
                error : 'fa fa-times-circle',
                success: 'fa fa-check-circle',
                pending: 'fa fa-circle-o-notch fa-spin'
            };

            var conf = function(main_config){
                //if(!angular.isObject(config))
                var default_config = {
                    field_feedback: angular.element('<span class="form-control-feedback validator-form-control-feedback"></span>'),
                    field_message: angular.element('<p class="help-block validator-field-message"></p>'),
                    icons: {
                        error : 'fa fa-times-circle',
                        success: 'fa fa-check-circle',
                        pending: 'fa fa-circle-o-notch fa-spin'
                    }
                }
                return angular.extend(main_config, default_config);
            }

            var getCustomIcon = function(config, icon){
                if(!angular.isObject(config) || angular.isUndefined(config['icons'])) return false;
                return angular.isUndefined(config['icons'][icon]) ? false : config['icons'][icon];
            };

            var getCustomMessage = function(config, field_name, rule){
                if(!angular.isObject(config) || angular.isUndefined(config['messages'])) return false;
                var field_errors = config['messages'][field_name];

                if(angular.isObject(field_errors) && !angular.isUndefined(field_errors[rule])){
                    return field_errors[rule];
                }
                return false;
            };

            var services = {};

            services.error = function(element, attrs, rule, params, config){
                services.reset(element);

                config = conf(config);
                var field_feedback = config['field_feedback'];
                var field_message = config['field_message'];

                field_error = getCustomMessage(config, attrs['name'], rule);
                field_error = field_error ? field_error : validatorMessages(element, attrs, rule, params);

                icon = getCustomIcon(config, 'error');
                icon = icon ? icon : icons.error;

                field_feedback.addClass(icon);
                field_message.html(field_error);
                form_group = element.parent();

                form_group.addClass('has-error has-feedback');
                form_group.append(field_message);
                form_group.append(field_feedback);
            };


            services.success = function(element, attrs, rule, params, config){
                services.reset(element);

                config = conf(config);
                var field_feedback = config['field_feedback'];
                var field_message = config['field_message'];
                icon = getCustomIcon(config, 'success');
                icon = icon ? icon : icons.success;

                field_feedback.addClass(icon);
                form_group = element.parent();
                form_group.addClass('has-success has-feedback');
                form_group.append(field_feedback);
            };

            services.pending = function(element, attrs, rule, params, config){
                services.reset(element);

                config = conf(config);
                var field_feedback = config['field_feedback'];
                var field_message = config['field_message'];
                icon = getCustomIcon(config, 'pending');
                icon = icon ? icon : icons.pending;

                var message = angular.isObject(params) && !angular.isUndefined(params['message']) ? params['message'] : 'checking...';
                message = '<i class="'+icon+'"></i> '+message;

                field_message.html(message);
                form_group = element.parent();

                form_group.addClass('has-warning has-feedback');
                form_group.append(field_message);
            };

            services.reset = function(element){
                form_group = element.parent();
                form_group.removeClass('has-error has-feedback');
                form_group.removeClass('has-success has-feedback');
                form_group.removeClass('has-warning has-feedback');
                form_group.find('.form-control-feedback').remove();
                form_group.find('.validator-field-message').remove();
            };

            return services;
        }]);

}).call(this);
