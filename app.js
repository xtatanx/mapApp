var express = require('express');
var app = express();
var http = require('http');
var port = Number(process.env.PORT || 5000)
var server = http.createServer(app).listen(port);
var io = require('socket.io').listen(server);

var connections = [];

app.configure(function(){
	app.use('/', express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* socket function */
io.sockets.on('connection', function(socket){
	/* every time server reciebe data emit to all  */
	socket.on('send:coords', function(data){
		connections.push(data);
		socket.emit('load:coords', connections);
	});
	socket.emit('load:coords', connections);

});




// console.log('Listening on port %d', server.address().port);

