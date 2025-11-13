angular.module('spotifyApp')
  .controller('ProfileController', ['$location', 'AuthService', 'SongService', 'PlaylistService', 
    function($location, AuthService, SongService, PlaylistService) {
      var self = this;
      self.user = null;
      self.loading = true;
      self.editing = false;
      self.stats = {
        totalSongs: 0,
        totalPlaylists: 0
      };
      self.editData = {
        username: ''
      };

      self.loadProfile = function() {
        AuthService.getProfile().then(function(profile) {
          self.user = profile;
          self.editData.username = profile.username;
          self.stats.totalSongs = profile.songsUploaded || 0;
          self.stats.totalPlaylists = profile.playlists || 0;
          self.loading = false;
        }).catch(function(error) {
          console.error('Error loading profile:', error);
          self.loading = false;
          // Try fallback to getCurrentUser
          AuthService.getCurrentUser().then(function(user) {
            self.user = user;
            self.editData.username = user.username;
            self.loading = false;
            self.loadStats();
          }).catch(function(err) {
            $location.path('/login');
          });
        });
      };

      self.loadStats = function() {
        // Fallback stats loading
        SongService.getAllSongs().then(function(songs) {
          self.stats.totalSongs = songs.length;
        }).catch(function(err) {
          console.log('Could not load songs');
        });

        PlaylistService.getMyPlaylists().then(function(playlists) {
          self.stats.totalPlaylists = playlists.length;
        }).catch(function(err) {
          console.log('Could not load playlists');
        });
      };

      self.toggleEdit = function() {
        self.editing = !self.editing;
        if (!self.editing) {
          self.editData.username = self.user.username;
        }
      };

      self.saveProfile = function() {
        // TODO: Implement profile update API
        console.log('Saving profile:', self.editData);
        self.user.username = self.editData.username;
        self.editing = false;
      };

      self.formatDate = function(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      self.loadProfile();
    }]);
