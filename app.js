var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);


app.configure(function(){
	app.use('/', express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* socket function */
io.sockets.on('connection', function(socket){
	/* every time someone connects place a marker in the map */
	socket.on('send:coords', function(data){
		socket.broadcast.emit('load:coords', data);
	});

});




// console.log('Listening on port %d', server.address().port);

