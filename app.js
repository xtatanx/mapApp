var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


app.configure(function(){
	app.use('/', express.static(__dirname + '/public'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


io.sockets.on('connection', function(socket){
	socket.emit('news', {hello: 'world'});
	socket.on('my other event', function(data){
		console.log(data);
	});
});

server.listen(3000, 'localhost');


// console.log('Listening on port %d', server.address().port);

