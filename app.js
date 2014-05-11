var app = require('express')()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

require('./config/express')(app);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/app/index.html');
});

var tracks = [];

// handlers for connections

io.sockets.on('connection', function (socket) {
    socket.emit('serverConnect');

    var rooms = {};
    var offers = {};
    var answers = {};

    socket.on('icecandidate', function(data){

	// if this is the first one with this room-id
	if(data.room in rooms) return;
	rooms[data.room] = data.candidate;

	socket.broadcast.emit('icecandidate', rooms[data.room]);
    });

    socket.on('offer', function(data){

	// if this is the first one with this room-id
	if(data.room in offers) return;
	offers[data.room] = data.offer;

	socket.broadcast.emit('offer', offers[data.room]);
    });

    socket.on('answer', function(data){

	// if this is the first one with this room-id
	if(data.room in answers) return;
	answers[data.room] = data.answer;

	socket.broadcast.emit('answer', answers[data.room]);
    });

});

app.get('/rooms', function(req, res){
    res.json({rooms:rooms});
});

app.get('*', function(req, res){
    res.sendfile(__dirname+'/app'+req.url);
});

server.listen(app.get('port'));
