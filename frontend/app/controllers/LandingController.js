angular.module('spotifyApp')
  .controller('LandingController', ['$location', 'AuthService', function($location, AuthService) {
    var self = this;

    // Redirect if already logged in
    if (AuthService.isAuthenticated()) {
      $location.path('/home');
    }

    self.goToLogin = function() {
      $location.path('/login');
    };

    self.goToSignup = function() {
      $location.path('/signup');
    };
  }]);
