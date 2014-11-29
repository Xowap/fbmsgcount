/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */
/*global angular */

(function (ng) {
    'use strict';

    var fb = ng.module('freneticbunny', []);

    fb.provider('fb', function () {
            // Variables
        var selfP = this,
            options = {
                url: '//connect.facebook.net/##LOCALE##/all.js',
                locale: 'en_US',
                status: true,
                xfbml: true,
                oauth: true,
                authResponse: undefined,
                fb_granted: null
            },

            // Objects
            FreneticBunny,

            // Methods
            setOptions,
            $get;

        FreneticBunny = function ($q, $document) {
            var self = this,
                promises = {},

                // Methods
                promiseFactory,
                loaded;

            promiseFactory = function (name, callback) {
                if (!promises.hasOwnProperty(name)) {
                    promises[name] = $q(callback);
                }

                return promises[name];
            };

            loaded = function () {
                return promiseFactory('loaded', function (resolve) {
                    var head = ng.element($document[0].getElementsByTagName('head')[0]),
                        script = ng.element('<script></script>'),
                        onload = function () {
                            resolve();
                        };

                    script.attr('type', 'text/javascript');
                    script.attr('src', options.url.replace('##LOCALE##', options.locale));

                    script[0].onload = onload;
                    script[0].onreadystatechange = onload;

                    head.append(script);
                });
            };

            self.loaded = loaded;
        };

        setOptions = function (newOptions) {
            ng.extend(options, newOptions);
        };

        $get = function ($q, $document) {
            return new FreneticBunny($q, $document);
        };

        selfP.setOptions = setOptions;
        selfP.$get = $get;
    });
}(angular));