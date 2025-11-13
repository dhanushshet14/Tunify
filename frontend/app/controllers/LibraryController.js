angular.module('spotifyApp')
  .controller('LibraryController', ['$location', 'PlaylistService', 'PlayerService', 
    function($location, PlaylistService, PlayerService) {
      var self = this;
      self.playlists = [];
      self.loading = true;
      self.showCreateModal = false;
      self.newPlaylistTitle = '';

      self.loadPlaylists = function() {
        PlaylistService.getMyPlaylists().then(function(playlists) {
          self.playlists = playlists;
          self.loading = false;
        });
      };

      self.openPlaylist = function(playlistId) {
        $location.path('/playlist/' + playlistId);
      };

      self.createPlaylist = function() {
        if (!self.newPlaylistTitle) return;

        PlaylistService.createPlaylist(self.newPlaylistTitle, false)
          .then(function(playlist) {
            self.playlists.push(playlist);
            self.showCreateModal = false;
            self.newPlaylistTitle = '';
          });
      };

      self.deletePlaylist = function(playlistId, event) {
        event.stopPropagation();
        if (confirm('Delete this playlist?')) {
          PlaylistService.deletePlaylist(playlistId).then(function() {
            self.playlists = self.playlists.filter(function(p) {
              return p._id !== playlistId;
            });
          });
        }
      };

      self.loadPlaylists();
    }]);
