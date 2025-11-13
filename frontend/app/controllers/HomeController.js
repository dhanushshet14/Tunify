angular.module('spotifyApp')
  .controller('HomeController', ['SongService', 'PlaylistService', 'PlayerService', 'AudiusService', '$timeout',
    function(SongService, PlaylistService, PlayerService, AudiusService, $timeout) {
      var self = this;
      self.songs = [];
      self.audiusTracks = [];
      self.playlists = [];
      self.loading = true;
      self.loadingAudius = true;
      self.activeTab = 'trending'; // 'trending' or 'myMusic'

      self.loadData = function() {
        // Load user's uploaded songs
        SongService.getAllSongs().then(function(songs) {
          self.songs = songs;
          self.loading = false;
        }).catch(function(error) {
          console.log('No user songs yet');
          self.loading = false;
        });

        // Load user's playlists
        PlaylistService.getMyPlaylists().then(function(playlists) {
          self.playlists = playlists;
        }).catch(function(error) {
          console.log('No playlists yet');
        });

        // Load trending tracks from Audius
        self.loadAudiusTracks();
      };

      self.loadAudiusTracks = function() {
        self.loadingAudius = true;
        AudiusService.getTrendingTracks(50).then(function(tracks) {
          self.audiusTracks = tracks;
          self.loadingAudius = false;
          console.log('Loaded Audius tracks:', tracks.length);
        }).catch(function(error) {
          console.error('Failed to load Audius tracks:', error);
          self.loadingAudius = false;
        });
      };

      self.playSong = function(song, index) {
        var queue = self.activeTab === 'trending' ? self.audiusTracks : self.songs;
        
        // If it's an Audius track, update the audioUrl to stream URL
        if (song.isAudius) {
          song.audioUrl = AudiusService.getTrackStreamUrl(song._id);
        }
        
        PlayerService.playSong(song, queue, index);
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

      self.formatPlayCount = function(count) {
        if (!count) return '0';
        if (count >= 1000000) {
          return (count / 1000000).toFixed(1) + 'M';
        }
        if (count >= 1000) {
          return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
      };

      self.loadData();
    }]);
