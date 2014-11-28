/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */

(function (ng) {
    'use strict';

    var app = ng.module('fbmsgcount', []);

    app.directive('eatClick', function () {
        return {
            'restrict': 'A',
            'link': function (scope, element) {
                /*jslint unparam: true*/
                element.click(function (event) {
                    event.preventDefault();
                });
            }
        };
    });

    app.controller('FbMsgCount', function ($scope) {
        var logIn;

        logIn = function () {
            $scope.mode = 'list';
        };

        // Public vars
        $scope.mode = 'intro';

        // Public methods
        $scope.logIn = logIn;
    });
}(angular));