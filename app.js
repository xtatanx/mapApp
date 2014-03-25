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
		// if id doesnt exist in connections push it
		if(!checkAvalibility(data.id)){
			connections.push(data);
		}

		io.sockets.emit('load:coords', connections);
	});

	socket.on('disconnect', function(){
		io.sockets.emit('user:disconnected');
	});	

});


// helper function to check if id exist in array
function checkAvalibility(id){
	for (var i = 0; i < connections.length; i++){
			if(connections[i].id === id){
				return true;
			}
	}
	return false;
}





// console.log('Listening on port %d', server.address().port);

