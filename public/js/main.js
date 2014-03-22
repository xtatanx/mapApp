$(function(){
	// Neccesary vars
	var id = Math.random().toString(36).substr(2,16);
	var sendData = {
		id:0,
		lat:0,
		lng:0
	}

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

	// helper function for creating markers
	function createMarker(lat, lng){
		var marker = L.marker([lat,lng]).addTo(map);
	}

	// function to execute after get location
	function onLocationFound(e){
		sendData.lat = e.latitude;
		sendData.lng = e.longitude;

		// random numbers local testing
		// sendData.lat = Math.floor((Math.random()* 50) +1);
		// sendData.lng = Math.floor((Math.random()* 50) +1);		
		sendData.id = id;
		console.log(sendData);
		// createMarker(sendData.lat, sendData.lng);
		createConnection();
	}

	/* set  initial markers markers*/
	function setMarkers(connections){
		for(var i = 0; i < connections.length; i++){
			createMarker(connections[i].lat, connections[i].lng);
		}
	}

	/* function to connect the socket*/
	function createConnection(){
		/* if The client support sockets create a connection */
		if(Modernizr.websockets){
			/* client socket */
			var host = location.origin.replace(/^http/, 'ws');
			var socket = io.connect(host);

			socket.emit('send:coords', sendData);

			socket.on('load:coords', function(data){
				console.log("aloooooo");
				setMarkers(data);
			});
		}
	}	

});
