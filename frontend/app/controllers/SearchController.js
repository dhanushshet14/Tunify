angular.module('spotifyApp')
  .controller('SearchController', ['$timeout', 'SongService', 'PlayerService', 
    function($timeout, SongService, PlayerService) {
      var self = this;
      self.query = '';
      self.results = [];
      self.searching = false;
      var searchTimeout;

      self.search = function() {
        if (searchTimeout) {
          $timeout.cancel(searchTimeout);
        }

        if (!self.query || self.query.length < 2) {
          self.results = [];
          return;
        }

        self.searching = true;
        searchTimeout = $timeout(function() {
          SongService.searchSongs(self.query).then(function(songs) {
            self.results = songs;
            self.searching = false;
          });
        }, 300);
      };

      self.playSong = function(song, index) {
        PlayerService.playSong(song, self.results, index);
      };

      self.addToQueue = function(song) {
        PlayerService.addToQueue(song);
      };
    }]);
