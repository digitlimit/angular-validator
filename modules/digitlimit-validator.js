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