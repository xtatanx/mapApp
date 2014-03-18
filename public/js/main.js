$(function(){
	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map',{
		center:[0,0],
		zoom:2,
		minzoom:2,
		maxZoom:18
	});

	var icon = L.icon({
		iconUrl: '../../img/marker-icon.png',
		shadowUrl: '../../img/marker-shadow.png',
		iconRetinaUrl: '../../img/marker-icon2x.png'
	});

	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);


	/* if The client support sockets create a connection */
	if(Modernizr.websockets){
		/* client socket */
		var socket = io.connect('http://localhost:3000');

		socket.on('load:coords', function(data){
			console.log(data);
			var lat = Math.floor((Math.random()*50)+1);
			var lng = Math.floor((Math.random()*50)+1);;

			var marker = L.marker([lat,lng], {icon: icon}).addTo(map);
			console.log(marker);
		});

		socket.emit('send:coords', {msg:'hello'});
	}

});
