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