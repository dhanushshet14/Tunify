angular.module('spotifyApp')
  .service('AuthService', ['$http', '$q', 'API_URL', function($http, $q, API_URL) {
    var self = this;
    self.currentUser = null;
    self.token = localStorage.getItem('token');

    self.signup = function(username, email, password) {
      console.log('AuthService: Sending signup request to:', API_URL + '/auth/signup');
      return $http({
        method: 'POST',
        url: API_URL + '/auth/signup',
        data: { username: username, email: email, password: password },
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(response) {
        console.log('AuthService: Signup response received:', response);
        self.token = response.data.token;
        self.currentUser = response.data.user;
        localStorage.setItem('token', self.token);
        return response.data;
      }).catch(function(error) {
        console.error('AuthService: Signup error:', error);
        throw error;
      });
    };

    self.login = function(email, password) {
      console.log('AuthService: Sending login request to:', API_URL + '/auth/login');
      return $http({
        method: 'POST',
        url: API_URL + '/auth/login',
        data: { email: email, password: password },
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(response) {
        console.log('AuthService: Login response received:', response);
        self.token = response.data.token;
        self.currentUser = response.data.user;
        localStorage.setItem('token', self.token);
        return response.data;
      }).catch(function(error) {
        console.error('AuthService: Login error:', error);
        throw error;
      });
    };

    self.logout = function() {
      self.token = null;
      self.currentUser = null;
      localStorage.removeItem('token');
    };

    self.isAuthenticated = function() {
      return !!self.token;
    };

    self.getToken = function() {
      return self.token;
    };

    self.getCurrentUser = function() {
      if (self.currentUser) {
        return $q.resolve(self.currentUser);
      }
      if (!self.token) {
        return $q.reject('Not authenticated');
      }
      return $http.get(API_URL + '/auth/me', {
        headers: { Authorization: 'Bearer ' + self.token }
      }).then(function(response) {
        self.currentUser = response.data;
        return self.currentUser;
      });
    };

    self.getProfile = function() {
      if (!self.token) {
        return $q.reject('Not authenticated');
      }
      return $http.get(API_URL + '/auth/profile', {
        headers: { Authorization: 'Bearer ' + self.token }
      }).then(function(response) {
        return response.data;
      });
    };
  }]);
