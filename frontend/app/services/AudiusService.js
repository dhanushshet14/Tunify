angular.module('spotifyApp')
  .service('AudiusService', ['$http', '$q', function($http, $q) {
    var self = this;
    var AUDIUS_API = 'https://api.audius.co/v1';

    self.getTrendingTracks = function(limit) {
      limit = limit || 50;
      console.log('Fetching trending tracks from Audius API...');
      
      return $http.get(AUDIUS_API + '/tracks/trending', {
        params: {
          limit: limit,
          app_name: 'Tunify'
        }
      }).then(function(response) {
        console.log('Audius API response:', response.data);
        if (response.data && response.data.data) {
          var tracks = response.data.data.map(function(track) {
            // Get the best quality artwork
            var artwork = '/uploads/default-cover.jpg';
            if (track.artwork) {
              artwork = track.artwork['1000x1000'] || track.artwork['480x480'] || track.artwork['150x150'];
            }
            
            return {
              _id: track.id,
              title: track.title,
              artist: track.user ? track.user.name : 'Unknown Artist',
              artistId: track.user ? track.user.id : null,
              album: track.mood || 'Single',
              coverUrl: artwork,
              duration: track.duration || 0,
              plays: track.play_count || 0,
              audioUrl: track.id, // We'll use this to stream from Audius
              tags: track.tags ? track.tags.split(',') : [],
              genre: track.genre || 'Music',
              isAudius: true, // Flag to identify Audius tracks
              permalink: track.permalink,
              releaseDate: track.release_date || track.created_at
            };
          });
          console.log('Processed tracks:', tracks.length);
          return tracks;
        }
        return [];
      }).catch(function(error) {
        console.error('Error fetching Audius tracks:', error);
        return [];
      });
    };

    self.searchTracks = function(query, limit) {
      limit = limit || 20;
      console.log('Searching Audius tracks:', query);
      
      return $http.get(AUDIUS_API + '/tracks/search', {
        params: {
          query: query,
          limit: limit
        }
      }).then(function(response) {
        if (response.data && response.data.data) {
          var tracks = response.data.data.map(function(track) {
            return {
              _id: track.id,
              title: track.title,
              artist: track.user ? track.user.name : 'Unknown Artist',
              album: track.mood || 'Single',
              coverUrl: track.artwork ? track.artwork['480x480'] || track.artwork['150x150'] : '/uploads/default-cover.jpg',
              duration: track.duration || 0,
              plays: track.play_count || 0,
              audioUrl: track.id,
              tags: track.tags ? track.tags.split(',') : [],
              isAudius: true,
              permalink: track.permalink
            };
          });
          return tracks;
        }
        return [];
      }).catch(function(error) {
        console.error('Error searching Audius tracks:', error);
        return [];
      });
    };

    self.getTrackStreamUrl = function(trackId) {
      // Use the full stream endpoint with app_name parameter for better quality
      return AUDIUS_API + '/tracks/' + trackId + '/stream?app_name=Tunify';
    };

    self.getTopGenres = function() {
      // Return popular genres for filtering
      return [
        'Electronic', 'Hip-Hop/Rap', 'Alternative', 'Pop', 
        'R&B/Soul', 'Rock', 'Dance/EDM', 'Indie', 'Jazz', 'Classical'
      ];
    };
  }]);
