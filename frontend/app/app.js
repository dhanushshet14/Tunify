angular.module('spotifyApp', ['ngRoute'])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
    
    // Add HTTP interceptor to attach Authorization header to all requests
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
      return {
        request: function(config) {
          // Attach token to all API requests
          var token = localStorage.getItem('token');
          if (token && config.url.indexOf('/api/') !== -1) {
            config.headers = config.headers || {};
            config.headers.Authorization = 'Bearer ' + token;
            console.log('🔐 Attaching token to request:', config.url);
          }
          return config;
        },
        responseError: function(rejection) {
          // Handle 401 errors
          if (rejection.status === 401) {
            console.error('❌ 401 Unauthorized - Redirecting to login');
            localStorage.removeItem('token');
            $location.path('/login');
          }
          return $q.reject(rejection);
        }
      };
    }]);
    
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
      .when('/profile', {
        templateUrl: 'app/views/profile.html',
        controller: 'ProfileController',
        controllerAs: 'profile',
        requireAuth: true
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService) {
    console.log('🚀 App initialized');
    
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      console.log('📍 Route change:', current ? current.$$route.originalPath : 'initial', '→', next ? next.$$route.originalPath : 'unknown');
      
      // Check if route requires authentication
      if (next && next.$$route && next.$$route.requireAuth) {
        if (!AuthService.isAuthenticated()) {
          console.warn('⚠️ Auth required but not authenticated - redirecting to login');
          event.preventDefault();
          $location.path('/login');
        } else {
          console.log('✅ Auth check passed');
        }
      }
      
      // Redirect authenticated users from landing page to home
      if (next && next.$$route && next.$$route.originalPath === '/' && AuthService.isAuthenticated()) {
        console.log('✅ Authenticated user on landing - redirecting to home');
        event.preventDefault();
        $location.path('/home');
      }
    });
    
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
      console.error('❌ Route change error:', rejection);
    });
    
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      console.log('✅ Route changed successfully');
    });
  }])
  .constant('API_URL', 'http://localhost:5000/api');
