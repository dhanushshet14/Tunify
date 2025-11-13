angular.module('spotifyApp')
  .controller('MainController', ['$location', 'AuthService', 'PlayerService', 
    function($location, AuthService, PlayerService) {
      var self = this;
      self.currentUser = null;

      self.isAuthenticated = function() {
        return AuthService.isAuthenticated();
      };

      self.logout = function() {
        AuthService.logout();
        PlayerService.pause();
        $location.path('/login');
      };

      if (self.isAuthenticated()) {
        AuthService.getCurrentUser().then(function(user) {
          self.currentUser = user;
        });
      }
    }]);
