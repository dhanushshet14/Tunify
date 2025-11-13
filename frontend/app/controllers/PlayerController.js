angular.module('spotifyApp')
  .controller('PlayerController', ['PlayerService', function(PlayerService) {
    var self = this;
    self.player = PlayerService;
    self.showQueue = false;

    self.togglePlay = function() {
      PlayerService.togglePlay();
    };

    self.next = function() {
      PlayerService.next();
    };

    self.previous = function() {
      PlayerService.previous();
    };

    self.seek = function() {
      PlayerService.seek();
    };

    self.setVolume = function() {
      PlayerService.setVolume();
    };

    self.toggleMute = function() {
      PlayerService.toggleMute();
    };

    self.toggleShuffle = function() {
      PlayerService.toggleShuffle();
    };

    self.toggleRepeat = function() {
      PlayerService.toggleRepeat();
    };

    self.toggleQueue = function() {
      self.showQueue = !self.showQueue;
    };

    self.removeFromQueue = function(index) {
      PlayerService.removeFromQueue(index);
    };

    self.formatTime = function(seconds) {
      return PlayerService.formatTime(seconds);
    };

    // Expose player properties
    Object.defineProperties(self, {
      currentSong: { get: function() { return PlayerService.currentSong; } },
      isPlaying: { get: function() { return PlayerService.isPlaying; } },
      shuffle: { get: function() { return PlayerService.shuffle; } },
      repeat: { get: function() { return PlayerService.repeat; } },
      volume: { 
        get: function() { return PlayerService.volume; },
        set: function(val) { PlayerService.volume = val; }
      },
      muted: { get: function() { return PlayerService.muted; } },
      currentTime: { 
        get: function() { return PlayerService.currentTime; },
        set: function(val) { PlayerService.currentTime = val; }
      },
      duration: { get: function() { return PlayerService.duration; } },
      queue: { get: function() { return PlayerService.queue; } },
      currentIndex: { get: function() { return PlayerService.currentIndex; } }
    });
  }]);
