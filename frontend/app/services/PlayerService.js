angular.module('spotifyApp')
  .service('PlayerService', ['$rootScope', 'SongService', function($rootScope, SongService) {
    var self = this;
    self.audio = new Audio();
    self.queue = [];
    self.currentIndex = -1;
    self.currentSong = null;
    self.isPlaying = false;
    self.shuffle = false;
    self.repeat = 'off'; // 'off', 'all', 'one'
    self.volume = 70;
    self.muted = false;
    self.currentTime = 0;
    self.duration = 0;

    // Initialize
    self.audio.volume = self.volume / 100;

    // Event listeners
    self.audio.addEventListener('timeupdate', function() {
      self.currentTime = self.audio.currentTime;
      $rootScope.$apply();
    });

    self.audio.addEventListener('loadedmetadata', function() {
      self.duration = self.audio.duration;
      $rootScope.$apply();
    });

    self.audio.addEventListener('ended', function() {
      self.next();
      $rootScope.$apply();
    });

    self.audio.addEventListener('play', function() {
      self.isPlaying = true;
      $rootScope.$apply();
    });

    self.audio.addEventListener('pause', function() {
      self.isPlaying = false;
      $rootScope.$apply();
    });

    self.playSong = function(song, queue, index) {
      if (queue) {
        self.queue = queue;
        self.currentIndex = index !== undefined ? index : 0;
      } else {
        self.queue = [song];
        self.currentIndex = 0;
      }
      
      self.currentSong = self.queue[self.currentIndex];
      
      // Handle Audius tracks differently
      var streamUrl;
      if (self.currentSong.isAudius) {
        // Audius tracks already have the full stream URL
        streamUrl = self.currentSong.audioUrl;
        console.log('Playing Audius track:', self.currentSong.title, streamUrl);
      } else {
        // Local tracks need URL conversion
        streamUrl = SongService.getStreamUrl(self.currentSong.audioUrl);
        console.log('Playing local track:', self.currentSong.title, streamUrl);
      }
      
      self.audio.src = streamUrl;
      self.audio.play().catch(function(error) {
        console.error('Error playing audio:', error);
      });
      
      // Only increment play count for local tracks
      if (!self.currentSong.isAudius) {
        SongService.incrementPlayCount(self.currentSong._id);
      }
      
      self.saveState();
    };

    self.play = function() {
      self.audio.play();
    };

    self.pause = function() {
      self.audio.pause();
    };

    self.togglePlay = function() {
      if (self.isPlaying) {
        self.pause();
      } else {
        self.play();
      }
    };

    self.next = function() {
      if (self.repeat === 'one') {
        self.audio.currentTime = 0;
        self.audio.play();
        return;
      }

      if (self.shuffle) {
        var nextIndex = Math.floor(Math.random() * self.queue.length);
        self.currentIndex = nextIndex;
      } else {
        self.currentIndex++;
        if (self.currentIndex >= self.queue.length) {
          if (self.repeat === 'all') {
            self.currentIndex = 0;
          } else {
            self.pause();
            return;
          }
        }
      }

      self.currentSong = self.queue[self.currentIndex];
      
      // Handle Audius tracks
      var streamUrl;
      if (self.currentSong.isAudius) {
        streamUrl = self.currentSong.audioUrl;
      } else {
        streamUrl = SongService.getStreamUrl(self.currentSong.audioUrl);
      }
      
      self.audio.src = streamUrl;
      self.audio.play();
      
      // Only increment play count for local tracks
      if (!self.currentSong.isAudius) {
        SongService.incrementPlayCount(self.currentSong._id);
      }
      
      self.saveState();
    };

    self.previous = function() {
      if (self.audio.currentTime > 3) {
        self.audio.currentTime = 0;
        return;
      }

      self.currentIndex--;
      if (self.currentIndex < 0) {
        self.currentIndex = self.queue.length - 1;
      }

      self.currentSong = self.queue[self.currentIndex];
      
      // Handle Audius tracks
      var streamUrl;
      if (self.currentSong.isAudius) {
        streamUrl = self.currentSong.audioUrl;
      } else {
        streamUrl = SongService.getStreamUrl(self.currentSong.audioUrl);
      }
      
      self.audio.src = streamUrl;
      self.audio.play();
      self.saveState();
    };

    self.seek = function() {
      self.audio.currentTime = self.currentTime;
    };

    self.setVolume = function() {
      self.audio.volume = self.volume / 100;
      self.muted = false;
    };

    self.toggleMute = function() {
      self.muted = !self.muted;
      self.audio.muted = self.muted;
    };

    self.toggleShuffle = function() {
      self.shuffle = !self.shuffle;
      self.saveState();
    };

    self.toggleRepeat = function() {
      if (self.repeat === 'off') {
        self.repeat = 'all';
      } else if (self.repeat === 'all') {
        self.repeat = 'one';
      } else {
        self.repeat = 'off';
      }
      self.saveState();
    };

    self.addToQueue = function(song) {
      self.queue.push(song);
      self.saveState();
    };

    self.removeFromQueue = function(index) {
      self.queue.splice(index, 1);
      if (index < self.currentIndex) {
        self.currentIndex--;
      }
      self.saveState();
    };

    self.saveState = function() {
      var state = {
        queue: self.queue,
        currentIndex: self.currentIndex,
        shuffle: self.shuffle,
        repeat: self.repeat,
        volume: self.volume
      };
      localStorage.setItem('playerState', JSON.stringify(state));
    };

    self.loadState = function() {
      var state = localStorage.getItem('playerState');
      if (state) {
        state = JSON.parse(state);
        self.queue = state.queue || [];
        self.currentIndex = state.currentIndex || -1;
        self.shuffle = state.shuffle || false;
        self.repeat = state.repeat || 'off';
        self.volume = state.volume || 70;
        self.audio.volume = self.volume / 100;
        
        if (self.queue.length > 0 && self.currentIndex >= 0) {
          self.currentSong = self.queue[self.currentIndex];
        }
      }
    };

    self.formatTime = function(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00';
      var mins = Math.floor(seconds / 60);
      var secs = Math.floor(seconds % 60);
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
    };

    // Load saved state on init
    self.loadState();
  }]);
