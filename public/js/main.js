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
	map.locate({setView:true, maxZoom:16, enableHighgAccuracy:true});
	map.on('locationfound', onLocationFound);



	var coords = coords || {};
	/* if The client support sockets create a connection */


	// helper function for creating markers
	function createMarker(lat, lng){
		var marker = L.marker([lat,lng]).addTo(map);
	}

	// function to execute after get location
	function onLocationFound(e){
		coords.lat = e.latitude;
		coords.lng = e.longitude;
		createMarker(coords.lat, coords.lng);
		createConnection();
	}

	/* function to connect the socket*/
	function createConnection(){
		if(Modernizr.websockets){
			/* client socket */
			var host = location.origin.replace(/^http/, 'ws');
			var socket = io.connect(host);

			socket.emit('send:coords', coords);

			socket.on('load:coords', function(data){
				console.log(data);
				createMarker(data.lat, data.lng);
			});
		}
	}	

});
