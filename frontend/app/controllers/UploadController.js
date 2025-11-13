angular.module('spotifyApp')
  .controller('UploadController', ['SongService', function(SongService) {
    var self = this;
    self.formData = {};
    self.audioFile = null;
    self.coverFile = null;
    self.uploading = false;
    self.success = false;
    self.error = null;

    self.onAudioSelect = function(files) {
      if (files && files.length > 0) {
        self.audioFile = files[0];
      }
    };

    self.onCoverSelect = function(files) {
      if (files && files.length > 0) {
        self.coverFile = files[0];
      }
    };

    self.upload = function() {
      if (!self.audioFile) {
        self.error = 'Please select an audio file';
        return;
      }

      self.uploading = true;
      self.error = null;
      self.success = false;

      var formData = new FormData();
      formData.append('audio', self.audioFile);
      if (self.coverFile) {
        formData.append('cover', self.coverFile);
      }
      formData.append('title', self.formData.title || '');
      formData.append('artist', self.formData.artist || '');
      formData.append('album', self.formData.album || '');
      formData.append('tags', self.formData.tags || '');

      SongService.uploadSong(formData)
        .then(function(song) {
          self.uploading = false;
          self.success = true;
          self.formData = {};
          self.audioFile = null;
          self.coverFile = null;
          document.getElementById('audioFile').value = '';
          document.getElementById('coverFile').value = '';
        })
        .catch(function(error) {
          self.uploading = false;
          self.error = error.data?.error || 'Upload failed';
        });
    };
  }]);
