var express = require('express');
var app = express();

// simple logger
app.use('/', express.static(__dirname + '/public'));


var server = app.listen(3000, function(){
	 console.log('Listening on port %d', server.address().port);
});