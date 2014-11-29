/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */
/*global angular,FB */

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
                fbGranted: null,
                version: 'v2.0'
            },

            // Objects
            FBPerms,
            FreneticBunny,

            // Methods
            setOptions,
            $get;

        FBPerms = function (perms) {
            var asArray;

            if (perms !== null) {
                asArray = perms.split(',');
            } else {
                asArray = [];
            }

            this.has = function (perms) {
                var testArray = perms.split(','),
                    valid = true;

                ng.forEach(testArray, function (v) {
                    if (asArray.indexOf(v) < 0) {
                        valid = false;
                    }
                });

                return valid;
            };

            this.split = function () {
                return asArray;
            };
        };

        FreneticBunny = function ($q, $document) {
            var self = this,
                promises = {},
                fbStatus,
                fbGranted,

                // Methods
                promiseFactory,
                handleAuthResponse,
                updateGranted,
                loaded,
                initialized,
                authenticated,
                connected;

            promiseFactory = function (name, callback) {
                if (!promises.hasOwnProperty(name)) {
                    promises[name] = $q(callback);
                }

                return promises[name];
            };

            handleAuthResponse = function (response) {
                fbStatus = response.status;
            };

            updateGranted = function () {
                return $q(function (resolve) {
                    authenticated().then(function () {
                        FB.api('/me/permissions', function (response) {
                            var newPerms = [];

                            if (!response || !response.data) {
                                resolve();
                                return;
                            }

                            ng.forEach(response.data, function (v) {
                                if (v.status === 'granted') {
                                    newPerms.push(v.permission);
                                }
                            });

                            fbGranted = new FBPerms(newPerms.join(','));
                            resolve();
                        });
                    });
                });
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

            initialized = function () {
                return promiseFactory('initialized', function (resolve) {
                    loaded().then(function () {
                        FB.init({
                            appId: options.appId,
                            channelUrl: options.channelUrl,
                            status: options.status,
                            xfbml: options.xfbml,
                            oauth: options.oauth,
                            version: options.version
                        });

                        resolve();
                    });
                });
            };

            authenticated = function () {
                return $q(function (resolve) {
                    if (fbStatus === 'connected') {
                        resolve();
                    } else {
                        initialized().then(function () {
                            FB.getLoginStatus(function (response) {
                                handleAuthResponse(response);
                                resolve();
                            });
                        });
                    }
                });
            };

            connected = function (perms, nologin) {
                return $q(function (resolve, reject) {
                    authenticated().then(function () {
                        var login;

                        login = function () {
                            if (fbGranted.has(perms)) {
                                resolve();
                            } else if (nologin !== true) {
                                FB.login(function (response) {
                                    handleAuthResponse(response);

                                    if (response.status !== 'connected') {
                                        reject('login_rejection');
                                        return;
                                    }

                                    updateGranted().then(function () {
                                        if (fbGranted.has(perms)) {
                                            resolve();
                                        } else {
                                            reject('partial_perms_after_login');
                                        }
                                    });
                                }, {
                                    scope: perms
                                });
                            }
                        };

                        if (!fbGranted.has(perms) && fbStatus === 'connected') {
                            updateGranted().then(login);
                        } else {
                            login();
                        }
                    });
                });
            };

            self.loaded = loaded;
            self.initialized = initialized;
            self.authenticated = authenticated;
            self.connected = connected;

            (function () {
                fbGranted = new FBPerms(options.fbGranted);
            }());
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