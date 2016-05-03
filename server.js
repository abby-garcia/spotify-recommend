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
        var artistID = item.artists.items[0].id;
        relatedArtist(artistID);
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });

    function relatedArtist(id) {
        var relatedArtistReq = getFromApi('artists/' + id + '/related-artists');

        relatedArtistReq.on('end', function(item) {
        var artists = item.artists;
        res.json(artists);
    });
        relatedArtistReq.on('error', function(code) {
        res.sendStatus(code);
    });


    }
     



});

app.listen(8080);