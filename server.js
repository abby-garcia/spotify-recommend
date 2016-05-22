var unirest = require('unirest');
var express = require('express');
var events = require('events');

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);
                }
                else {
                    emitter.emit('error', response.code);
                }
            });
    return emitter;
};

var relatedArtist = function(artist,res) {
    var relatedArtistReq = getFromApi('artists/' + artist.id + '/related-artists',{});
    var totalArtists = 0;
    var completedArtists = 0;





    relatedArtistReq.on('end', function(items) {
         artist.related =[];
         totalArtists = items.artists.length;
         items.artists.forEach(function(item){
            var topTracks = getFromApi('artists/' + item.id + '/top-tracks',{
                country:"US"
            });
            topTracks.on('end', function(tracks){
                item.tracks = tracks.tracks; //parameter and json format
                 artist.related.push(item);// we changed item object in line 30
                 completedArtists++;
                 checkComplete();
            });
           
        });
       
    });

    var checkComplete = function(){
        if(totalArtists == completedArtists){
             res.json(artist); // can't have run until all calls have been made
        }

    }
}


// Express 

var app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
    
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });

    searchReq.on('end', function(item) {
        var artist = item.artists.items[0];
        relatedArtist(artist,res);
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });

});
















app.listen(8080);

