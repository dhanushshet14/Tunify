angular.module('spotifyApp')
  .service('SocketService', ['$rootScope', function($rootScope) {
    var self = this;
    self.socket = io('http://localhost:5000');

    self.on = function(eventName, callback) {
      self.socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(self.socket, args);
        });
      });
    };

    self.emit = function(eventName, data, callback) {
      self.socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(self.socket, args);
          }
        });
      });
    };

    self.joinPlaylist = function(playlistId) {
      self.emit('join-playlist', playlistId);
    };

    self.leavePlaylist = function(playlistId) {
      self.emit('leave-playlist', playlistId);
    };
  }]);
