$(function(){
	// cache some vars
	var sendData = {
		lat:0,
		lng:0
	}

	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map',{
		center:[0,0],
		zoom:15,
		maxZoom:18
	});

	// handle connections and id's except mine
	var connections = [];
	// store markers currently placed in the map
	var markers = [];
	// store the closest conenctions to my position
	var closestConnections = [];

	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	// change the default path of marker images
	L.Icon.Default.imagePath = '../img';

	// get user current location
	map.locate({setView:true, maxZoom:15, enableHighgAccuracy:true});
	map.on('locationfound', onLocationFound);

	$('#search_people').on('click', searchPeople);

	// helper function for creating markers
	function createMarker(lat, lng){
		var marker = L.marker([lat,lng]).addTo(map);
	}

	// set  initial markers markers 
	function setMarkers(connections){
		for(var i = 0; i < connections.length; i++){
			var marker={}
			marker.id = connections[i].id;
			marker.markerObj = L.marker([connections[i].lat,connections[i].lng]);
			if(!markerInArray(marker, markers)){
				markers.push(marker);
				map.addLayer(marker.markerObj);
			}
		}
	}

	//  check if marker id already exists in markers array
	function markerInArray(marker, markers){
		for(var i = 0; i < markers.length; i++){
			return (markers[0].id === marker.id);
		}
			return false;
	}	

	// function to execute after get location
	function onLocationFound(e){
		sendData.lat = e.latitude;
		sendData.lng = e.longitude;
		createMarker(e.latitude, e.longitude);
		// initialize a socket connection 
		createConnection();
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
				// add data as a new connection
				connections.push(data);
				setMarkers(connections);
			});

			socket.on('user:disconnected', function(id){
				// if user get deisconnected remove its connection and its marker
				removeConnection(id);
				removeMarker(id);
			});
		}
	}

	/* function to search people near me */
	function searchPeople(){
		var myPosition = L.latLng(sendData.lat, sendData.lng);
		for(var i = 0; i < connections.length; i++){
			var otherPosition = L.latLng(connections[i].lat,connections[i].lng);
			// distance betwen my position and someone else's position
			var distance = myPosition.distanceTo(otherPosition);
			console.log(distance);
			if(distance <= 1000){
				// push user id, lat and lng to closestConnections
				closestConnections.push(connections[i]);
			} 
		}
		console.log(closestConnections);
	}

	/* this function remove  connections disconnected based on socket id */
	function removeConnection(id){
		for(var i = 0; i < connections.length; i++){
			if(connections[i].id == id){
				// delete connection located in i index in connections
				connections.splice(i, 1);
			}
		}
	}

	/* function to remove markers already placed in map */
	function removeMarker(id){
		for(var i = 0; i < markers.length; i++){
			if(markers[i].id === id){
				map.removeLayer(markers[i].markerObj);
				// delete marker located in i index in markers
				markers.splice(i, 1);
			}
		}
	}			

});
