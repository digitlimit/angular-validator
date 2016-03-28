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