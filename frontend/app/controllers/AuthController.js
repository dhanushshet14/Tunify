angular.module('spotifyApp')
  .controller('AuthController', ['$location', '$timeout', 'AuthService', function($location, $timeout, AuthService) {
    var self = this;
    
    // Initialize data objects
    self.loginData = {
      email: '',
      password: ''
    };
    
    self.signupData = {
      username: '',
      email: '',
      password: ''
    };
    
    self.loginError = null;
    self.signupError = null;
    self.loading = false;

    // Redirect if already logged in
    if (AuthService.isAuthenticated()) {
      $location.path('/home');
    }

    // Login submit
    self.submitLogin = function() {
      self.loginError = null;
      self.loading = true;
      
      console.log('Attempting login with:', self.loginData.email);
      
      AuthService.login(self.loginData.email, self.loginData.password)
        .then(function(response) {
          console.log('Login successful:', response);
          self.loading = false;
          $timeout(function() {
            $location.path('/home');
          }, 100);
        })
        .catch(function(error) {
          console.error('Login error:', error);
          self.loading = false;
          self.loginError = (error.data && error.data.error) || 'Login failed. Please check your credentials.';
        });
    };

    // Signup submit
    self.submitSignup = function() {
      self.signupError = null;
      self.loading = true;
      
      console.log('Attempting signup with:', self.signupData.username, self.signupData.email);
      
      AuthService.signup(self.signupData.username, self.signupData.email, self.signupData.password)
        .then(function(response) {
          console.log('Signup successful:', response);
          self.loading = false;
          $timeout(function() {
            $location.path('/home');
          }, 100);
        })
        .catch(function(error) {
          console.error('Signup error:', error);
          self.loading = false;
          self.signupError = (error.data && error.data.error) || 'Signup failed. Please try again.';
        });
    };
  }]);
