angular.module('spotifyApp')
  .controller('PlaylistController', ['$routeParams', 'PlaylistService', 'PlayerService', 'SocketService',
    function($routeParams, PlaylistService, PlayerService, SocketService) {
      var self = this;
      self.playlist = null;
      self.loading = true;
      self.editing = false;
      self.editTitle = '';

      self.loadPlaylist = function() {
        PlaylistService.getPlaylist($routeParams.id).then(function(playlist) {
          self.playlist = playlist;
          self.editTitle = playlist.title;
          self.loading = false;
          SocketService.joinPlaylist(playlist._id);
        });
      };

      self.playSong = function(song, index) {
        PlayerService.playSong(song, self.playlist.songs, index);
      };

      self.playAll = function() {
        if (self.playlist.songs.length > 0) {
          PlayerService.playSong(self.playlist.songs[0], self.playlist.songs, 0);
        }
      };

      self.removeSong = function(song) {
        PlaylistService.removeSongFromPlaylist(self.playlist._id, song._id)
          .then(function(updatedPlaylist) {
            self.playlist = updatedPlaylist;
          });
      };

      self.updateTitle = function() {
        if (self.editTitle && self.editTitle !== self.playlist.title) {
          PlaylistService.updatePlaylist(self.playlist._id, { title: self.editTitle })
            .then(function(updatedPlaylist) {
              self.playlist.title = updatedPlaylist.title;
              self.editing = false;
            });
        } else {
          self.editing = false;
        }
      };

      // Listen for real-time updates
      SocketService.on('playlist-updated', function(updatedPlaylist) {
        if (updatedPlaylist._id === self.playlist._id) {
          self.loadPlaylist();
        }
      });

      self.loadPlaylist();

      // Cleanup on controller destroy
      self.$onDestroy = function() {
        if (self.playlist) {
          SocketService.leavePlaylist(self.playlist._id);
        }
      };
    }]);
