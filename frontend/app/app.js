angular.module('spotifyApp', ['ngRoute'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/views/landing.html',
        controller: 'LandingController',
        controllerAs: 'landing'
      })
      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'AuthController',
        controllerAs: 'auth'
      })
      .when('/signup', {
        templateUrl: 'app/views/signup.html',
        controller: 'AuthController',
        controllerAs: 'auth'
      })
      .when('/home', {
        templateUrl: 'app/views/home.html',
        controller: 'HomeController',
        controllerAs: 'home',
        requireAuth: true
      })
      .when('/search', {
        templateUrl: 'app/views/search.html',
        controller: 'SearchController',
        controllerAs: 'search',
        requireAuth: true
      })
      .when('/library', {
        templateUrl: 'app/views/library.html',
        controller: 'LibraryController',
        controllerAs: 'library',
        requireAuth: true
      })
      .when('/upload', {
        templateUrl: 'app/views/upload.html',
        controller: 'UploadController',
        controllerAs: 'upload',
        requireAuth: true
      })
      .when('/playlist/:id', {
        templateUrl: 'app/views/playlist.html',
        controller: 'PlaylistController',
        controllerAs: 'playlist',
        requireAuth: true
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService) {
    $rootScope.$on('$routeChangeStart', function(event, next) {
      if (next && next.requireAuth && !AuthService.isAuthenticated()) {
        event.preventDefault();
        $location.path('/login');
      } else if (next && next.$$route && next.$$route.originalPath === '/' && AuthService.isAuthenticated()) {
        event.preventDefault();
        $location.path('/home');
      }
    });
  }])
  .constant('API_URL', 'http://localhost:5000/api');
