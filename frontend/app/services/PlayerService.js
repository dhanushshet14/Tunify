angular.module('spotifyApp')
  .service('PlayerService', ['$rootScope', '$timeout', 'SongService', function($rootScope, $timeout, SongService) {
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
    self.buffered = 0;
    self.loading = false;
    self.showQueue = false;

    // Performance optimization - debounce UI updates
    var timeUpdateDebounce = null;
    var isUpdating = false;

    // Initialize audio settings for smooth playback
    self.audio.volume = self.volume / 100;
    self.audio.preload = 'auto'; // Preload audio for smooth playback
    self.audio.crossOrigin = 'anonymous'; // Enable CORS

    // Optimized timeupdate - only update every 250ms to prevent jitter
    self.audio.addEventListener('timeupdate', function() {
      if (!isUpdating) {
        isUpdating = true;
        if (timeUpdateDebounce) {
          $timeout.cancel(timeUpdateDebounce);
        }
        timeUpdateDebounce = $timeout(function() {
          self.currentTime = self.audio.currentTime;
          self.updateBuffered();
          isUpdating = false;
        }, 250);
      }
    });

    self.audio.addEventListener('loadstart', function() {
      console.log('🎵 [AUDIO] loadstart - Starting to load audio');
      $timeout(function() {
        self.loading = true;
      });
    });

    self.audio.addEventListener('loadedmetadata', function() {
      console.log('🎵 [AUDIO] loadedmetadata - Duration:', self.audio.duration);
      $timeout(function() {
        self.duration = self.audio.duration;
        self.loading = false;
      });
    });

    self.audio.addEventListener('loadeddata', function() {
      console.log('🎵 [AUDIO] loadeddata - First frame loaded');
    });

    self.audio.addEventListener('canplay', function() {
      console.log('🎵 [AUDIO] canplay - Ready to play');
      $timeout(function() {
        self.loading = false;
      });
    });

    self.audio.addEventListener('canplaythrough', function() {
      console.log('🎵 [AUDIO] canplaythrough - Can play without buffering');
    });

    self.audio.addEventListener('waiting', function() {
      console.log('⏳ [AUDIO] waiting - Buffering...');
      $timeout(function() {
        self.loading = true;
      });
    });

    self.audio.addEventListener('playing', function() {
      console.log('▶️ [AUDIO] playing - Playback started');
      $timeout(function() {
        self.loading = false;
      });
    });

    self.audio.addEventListener('ended', function() {
      console.log('🏁 [AUDIO] ended - Track finished');
      $timeout(function() {
        self.next();
      });
    });

    self.audio.addEventListener('play', function() {
      console.log('▶️ [AUDIO] play event');
      $timeout(function() {
        self.isPlaying = true;
      });
    });

    self.audio.addEventListener('pause', function() {
      console.log('⏸️ [AUDIO] pause event');
      $timeout(function() {
        self.isPlaying = false;
      });
    });

    self.audio.addEventListener('seeking', function() {
      console.log('⏩ [AUDIO] seeking to:', self.audio.currentTime);
    });

    self.audio.addEventListener('seeked', function() {
      console.log('✅ [AUDIO] seeked - Seek complete');
    });

    self.audio.addEventListener('stalled', function() {
      console.warn('⚠️ [AUDIO] stalled - Network stalled');
    });

    self.audio.addEventListener('suspend', function() {
      console.log('⏸️ [AUDIO] suspend - Loading suspended');
    });

    self.audio.addEventListener('error', function(e) {
      console.error('❌ [AUDIO] ERROR:', {
        error: e,
        code: self.audio.error ? self.audio.error.code : 'unknown',
        message: self.audio.error ? self.audio.error.message : 'unknown',
        src: self.audio.src,
        networkState: self.audio.networkState,
        readyState: self.audio.readyState
      });
      $timeout(function() {
        self.loading = false;
        self.isPlaying = false;
      });
    });

    // Update buffered ranges
    self.updateBuffered = function() {
      if (self.audio.buffered.length > 0 && self.duration > 0) {
        var bufferedEnd = self.audio.buffered.end(self.audio.buffered.length - 1);
        self.buffered = (bufferedEnd / self.duration) * 100;
      }
    };

    self.playSong = function(song, queue, index) {
      console.log('\n🎵 ========== PLAY SONG ==========');
      console.log('Song:', song.title, 'by', song.artist);
      console.log('Queue length:', queue ? queue.length : 1);
      console.log('Index:', index);
      console.log('Time:', new Date().toISOString());
      
      if (queue) {
        self.queue = queue;
        self.currentIndex = index !== undefined ? index : 0;
      } else {
        self.queue = [song];
        self.currentIndex = 0;
      }
      
      self.currentSong = self.queue[self.currentIndex];
      self.loading = true;
      
      // Handle Audius tracks differently
      var streamUrl;
      if (self.currentSong.isAudius) {
        streamUrl = self.currentSong.audioUrl;
        console.log('🌐 Playing Audius track');
        console.log('URL:', streamUrl);
      } else {
        streamUrl = SongService.getStreamUrl(self.currentSong.audioUrl);
        console.log('💿 Playing local track');
        console.log('URL:', streamUrl);
      }
      
      // Smooth transition - only change src if different
      if (self.audio.src !== streamUrl) {
        console.log('🔄 Changing audio source...');
        self.audio.src = streamUrl;
        self.audio.load(); // Preload for smooth playback
        console.log('✅ Audio source set and loading');
      } else {
        console.log('ℹ️ Same source, reusing');
      }
      
      // Play with error handling
      console.log('▶️ Attempting to play...');
      var playPromise = self.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(function() {
          console.log('✅ Playback started successfully');
          console.log('==================================\n');
          self.loading = false;
        }).catch(function(error) {
          console.error('❌ Error playing audio:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('==================================\n');
          self.loading = false;
          self.isPlaying = false;
        });
      }
      
      // Only increment play count for local tracks
      if (!self.currentSong.isAudius) {
        SongService.incrementPlayCount(self.currentSong._id).catch(function(err) {
          console.log('⚠️ Could not increment play count:', err);
        });
      }
      
      self.saveState();
      
      // Preload next track for seamless playback
      self.preloadNextTrack();
    };

    // Preload next track for smooth transitions
    self.preloadNextTrack = function() {
      var nextIndex = self.currentIndex + 1;
      if (nextIndex < self.queue.length) {
        var nextSong = self.queue[nextIndex];
        var nextUrl = nextSong.isAudius ? nextSong.audioUrl : SongService.getStreamUrl(nextSong.audioUrl);
        // Create a temporary audio element to preload
        var preloader = new Audio();
        preloader.src = nextUrl;
        preloader.preload = 'auto';
      }
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

    self.seek = function(time) {
      if (time !== undefined) {
        self.currentTime = time;
      }
      // Instant seek without reloading
      if (self.audio.readyState >= 2) { // HAVE_CURRENT_DATA
        self.audio.currentTime = self.currentTime;
      }
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
