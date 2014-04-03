var express = require('express');
var app = express();
var http = require('http');
var port = Number(process.env.PORT || 5000)
var server = http.createServer(app).listen(port);
var io = require('socket.io').listen(server);

app.configure(function(){
	app.use('/', express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/* socket function */
io.sockets.on('connection', function(socket){
	/* every time server recieve data emit to all  */
	socket.on('send:coords', function(data){
		data.id = socket.id;
		socket.broadcast.emit('load:coords', data);
	});

	socket.on('closest:people', function(data){
		for(var i = 0; i < data.length; i++){
			io.sockets.socket(data[i].id).emit('alert:msg', 'you are near someone else');
		}
	});

	socket.on('disconnect', function(){
		socket.broadcast.emit('user:disconnected', socket.id);
	});	

});

// console.log('Listening on port %d', server.address().port);

