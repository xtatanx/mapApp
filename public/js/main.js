$(function(){
	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map',{
		center:[0,0],
		zoom:2,
		minzoom:2,
		maxZoom:18
	});


	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	// change the default path of marker images
	L.Icon.Default.imagePath = '../img';

	// get user current location
	map.locate({setView:true, maxZoom:2, enableHighgAccuracy:true});
	map.on('locationfound', onLocationFound);

	// function to execute after get location
	function onLocationFound(e){
		console.log(e);
		var lat = e.latitude;
		var lng = e.longitude;
		createMarker(lat, lng);
	}

	/* if The client support sockets create a connection */
	if(Modernizr.websockets){
		/* client socket */
		var socket = io.connect('/');

		socket.on('load:coords', function(data){
			console.log(data);
			var lat = Math.floor((Math.random()*50)+1);
			var lng = Math.floor((Math.random()*50)+1);;

			createMarker(lat, lng);
		});

		socket.emit('send:coords', {msg:'hello'});
	}

	// helper function for creating markers
	function createMarker(lat, lng){
		var marker = L.marker([lat,lng]).addTo(map);
	}

});
