/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */
/*global angular, jQuery*/

(function (ng) {
    'use strict';

    var app = ng.module('fbmsgcount', ['freneticbunny']);

    app.config(function (fbProvider) {
        fbProvider.setOptions({
            appId: 752317044845171,
            locale: 'en_US'
        });
    });

    app.directive('eatClick', function () {
        return {
            'restrict': 'A',
            'link': function (scope, element) {
                /*jslint unparam: true*/
                element.on('click', function (event) {
                    event.preventDefault();
                });
            }
        };
    });

    app.controller('FbMsgCount', function ($scope, fb) {
        var logIn;

        logIn = function () {
            fb.connected('read_mailbox').then(function () {
                console.log('loaded');
            });
        };

        // Public vars
        $scope.mode = 'intro';

        // Public methods
        $scope.logIn = logIn;
    });
}(angular));