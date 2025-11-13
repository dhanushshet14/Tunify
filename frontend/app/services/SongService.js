angular.module('spotifyApp')
  .service('SongService', ['$http', 'API_URL', 'AuthService', function($http, API_URL, AuthService) {
    var self = this;

    function getHeaders() {
      return { Authorization: 'Bearer ' + AuthService.getToken() };
    }

    self.getAllSongs = function() {
      return $http.get(API_URL + '/songs/all', { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.getSong = function(id) {
      return $http.get(API_URL + '/songs/' + id, { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.searchSongs = function(query) {
      return $http.get(API_URL + '/songs/search?q=' + encodeURIComponent(query), 
        { headers: getHeaders() })
        .then(function(response) { return response.data; });
    };

    self.uploadSong = function(formData) {
      return $http.post(API_URL + '/songs/upload', formData, {
        headers: angular.extend(getHeaders(), { 'Content-Type': undefined }),
        transformRequest: angular.identity
      }).then(function(response) { return response.data; });
    };

    self.incrementPlayCount = function(id) {
      return $http.post(API_URL + '/songs/' + id + '/play', {}, { headers: getHeaders() });
    };

    self.getStreamUrl = function(audioUrl) {
      return 'http://localhost:5000' + audioUrl.replace('/uploads/', '/api/stream/');
    };
  }]);
