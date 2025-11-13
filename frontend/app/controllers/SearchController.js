angular.module('spotifyApp')
  .controller('SearchController', ['$timeout', 'SongService', 'AudiusService', 'PlayerService', 
    function($timeout, SongService, AudiusService, PlayerService) {
      var self = this;
      self.query = '';
      self.localResults = [];
      self.audiusResults = [];
      self.searching = false;
      self.activeTab = 'all'; // 'all', 'local', 'audius'
      var searchTimeout;

      // Optimized search with 300ms debounce and result caching
      var searchCache = {};
      
      self.search = function() {
        if (searchTimeout) {
          $timeout.cancel(searchTimeout);
        }

        if (!self.query || self.query.length < 2) {
          self.localResults = [];
          self.audiusResults = [];
          self.searching = false;
          return;
        }

        // Check cache first
        var cacheKey = self.query.toLowerCase();
        if (searchCache[cacheKey]) {
          console.log('📦 Using cached results for:', cacheKey);
          self.localResults = searchCache[cacheKey].local;
          self.audiusResults = searchCache[cacheKey].audius;
          self.searching = false;
          return;
        }

        self.searching = true;
        
        searchTimeout = $timeout(function() {
          var currentQuery = self.query;
          
          // Search local songs
          SongService.searchSongs(currentQuery).then(function(songs) {
            // Only update if query hasn't changed
            if (currentQuery === self.query) {
              self.localResults = songs;
              
              // Cache results
              if (!searchCache[cacheKey]) {
                searchCache[cacheKey] = { local: songs, audius: [] };
              } else {
                searchCache[cacheKey].local = songs;
              }
            }
          }).catch(function(err) {
            console.error('Local search error:', err);
            self.localResults = [];
          });

          // Search Audius
          AudiusService.searchTracks(currentQuery, 20).then(function(tracks) {
            // Only update if query hasn't changed
            if (currentQuery === self.query) {
              self.audiusResults = tracks;
              self.searching = false;
              
              // Cache results
              if (!searchCache[cacheKey]) {
                searchCache[cacheKey] = { local: [], audius: tracks };
              } else {
                searchCache[cacheKey].audius = tracks;
              }
            }
          }).catch(function(err) {
            console.error('Audius search error:', err);
            self.audiusResults = [];
            self.searching = false;
          });
        }, 300); // Optimized to 300ms debounce
      };

      self.getAllResults = function() {
        return self.localResults.concat(self.audiusResults);
      };

      self.getFilteredResults = function() {
        if (self.activeTab === 'local') {
          return self.localResults;
        } else if (self.activeTab === 'audius') {
          return self.audiusResults;
        } else {
          return self.getAllResults();
        }
      };

      self.playSong = function(song, index) {
        var results = self.getFilteredResults();
        
        // If it's an Audius track, update the audioUrl to stream URL
        if (song.isAudius) {
          song.audioUrl = AudiusService.getTrackStreamUrl(song._id);
        }
        
        PlayerService.playSong(song, results, index);
      };

      self.addToQueue = function(song) {
        // If it's an Audius track, update the audioUrl to stream URL
        if (song.isAudius) {
          song.audioUrl = AudiusService.getTrackStreamUrl(song._id);
        }
        
        PlayerService.addToQueue(song);
      };

      self.switchTab = function(tab) {
        self.activeTab = tab;
      };

      self.formatDuration = function(seconds) {
        if (!seconds) return '0:00';
        var mins = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
      };
    }]);
