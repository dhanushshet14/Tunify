angular.module('spotifyApp')
  .service('PlaylistService', ['$http', 'API_URL', 'AuthService', function($http, API_URL, AuthService) {
    var self = this;

    function getHeaders() {
      return { Authorization: 'Bearer ' + AuthService.getToken() };
    }

    self.createPlaylist = function(title, isPublic) {
      return $http.post(API_URL + '/playlists/create', 
        { title: title, public: isPublic }, 
        { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.getMyPlaylists = function() {
      return $http.get(API_URL + '/playlists/my', { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.getPlaylist = function(id) {
      return $http.get(API_URL + '/playlists/' + id, { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.updatePlaylist = function(id, data) {
      return $http.put(API_URL + '/playlists/' + id, data, { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.deletePlaylist = function(id) {
      return $http.delete(API_URL + '/playlists/' + id, { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.addSongToPlaylist = function(playlistId, songId) {
      return $http.post(API_URL + '/playlists/' + playlistId + '/addSong', 
        { songId: songId }, 
        { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.removeSongFromPlaylist = function(playlistId, songId) {
      return $http.post(API_URL + '/playlists/' + playlistId + '/removeSong', 
        { songId: songId }, 
        { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };
  }]);
