/*vim: fileencoding=utf8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */
/*global angular, jQuery, FB*/

(function (ng) {
    'use strict';

    var app = ng.module('fbmsgcount', ['freneticbunny']),

        PERMS = 'read_mailbox,user_friends';

    app.config(function (fbProvider) {
        fbProvider.setOptions({
            appId: 264234630307385,
            locale: 'en_US',
            version: 'v2.0'
        });
    });

    app.run(function (fb) {
        fb.initialized();
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
        var logIn,
            makeListFromFB,
            loadList;

        logIn = function () {
            fb.connected(PERMS).then(function () {
                $scope.mode = 'list';
            });
        };

        makeListFromFB = function (list) {
            var output = [];

            ng.forEach(list, function (item) {
                if (item.recipients.length === 2) {
                    output.push({
                        id: item.recipients[0] === item.viewer_id
                            ? item.recipients[1] : item.recipients[0],
                        count: item.message_count
                    });
                }
            });

            return output;
        };

        loadList = function () {
            fb.connected(PERMS).then(function () {
                FB.api('/v2.0/fql', {
                    format: 'json',
                    q: 'SELECT viewer_id,recipients,message_count ' +
                        'FROM thread WHERE folder_id = 0 ' +
                        'ORDER BY message_count DESC'
                }, function (response) {
                    if (response.data) {
                        $scope.$apply(function () {
                            $scope.list.length = 0;
                            $scope.list.push.apply($scope.list, makeListFromFB(response.data));
                        });
                    }
                });
            });
        };

        // Public vars
        $scope.mode = 'intro';
        $scope.list = [];

        // Public methods
        $scope.logIn = logIn;
        $scope.graphObject = fb.graphObject;

        (function () {
            $scope.$watch('mode', function (mode) {
                if (mode === 'list') {
                    loadList();
                }
            });

            fb.connected(PERMS, true).then(function () {
                $scope.mode = 'list';
            });
        }());
    });
}(angular));