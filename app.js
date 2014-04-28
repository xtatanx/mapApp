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

	socket.on('changed:coords', function(data){
		data.id = socket.id;
		socket.broadcast.emit('update:coords', data);
	});

	socket.on('closest:people', function(data){
		console.log('closest people objects: ', data);
		for(var i = 0; i < data['targets'].length; i++){
			io.sockets.socket(data['targets'][i].id).emit('notify:travel', {
				myAddress: data['myAdress'],
				myDestiny: data['myDestiny']
			});
		}
	});

	socket.on('disconnect', function(){
		socket.broadcast.emit('user:disconnected', socket.id);
	});	

});

// console.log('Listening on port %d', server.address().port);

