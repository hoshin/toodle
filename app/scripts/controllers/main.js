'use strict';

angular.module('toodleApp')
    .controller('MainCtrl', function ($scope, $http, $location, $window) {
        $scope.tournamentName = '';
        $scope.tournamentDescription = '';
        $scope.tournamentStartDate = '';
        _paq.push(['setDocumentTitle', 'Home']);
        _paq.push(['trackPageView']);

        $scope.hideLocalAlerts = function(){
            $scope.tourneyCreationKo = false;
        };

        $scope.createTourney = function () {
            $scope.hideLocalAlerts();
            $http.post('/api/tournament/', {tournamentName: $scope.tournamentName, players: [], description:$scope.tournamentDescription, startDate:$scope.tournamentStartDate})
                .success(function (res) {
                    $scope.tournamentName = '';
                    $window.location = '/admin/'+res.adminURL;
                })
                .error(function (err) {
                    $scope.errorMessage = err.errors.tournamentName.message;
                    $scope.tourneyCreationKo = true;
                });
        };

        $scope.openDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
    });
