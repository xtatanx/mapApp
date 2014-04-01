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

	//  // set  initial markers markers 
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

		console.log(markers);
	}

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
				console.log(data);
				connections.push(data);
				setMarkers(connections);
			});

			socket.on('user:disconnected', function(id){
				console.log('user with id: ' + id + ' got disconnected');
				removeConnection(id);
				removeMarker(id);
			});
		}
	}

	/* function to search people near me */
	function searchPeople(){
		var myPosition = L.latLng(sendData.lat, sendData.lng);
		var otherConnections = otherPeople;
		for(var i = 0; i < otherConnections.length; i++){
			var otherPosition = L.latLng(otherConnections[i].lat,otherConnections[i].lng);
			var distance = myPosition.distanceTo(otherPosition);
			if(distance <= 1000){
				closestConnections.push(otherPosition);
			} 
		}
		console.log(closestConnections);
	}

	/* this fucntion connections disconnected based on socket id */
	function removeConnection(id){
		for(var i = 0; i < connections.length; i++){
			console.log('connections before remove: ');
			console.log(connections);
			if(connections[i].id === id){
				connections.splice(connections[i], 1);	
			}
		}
		console.log('connections after remove: ');
		console.log(connections);
	}

	/* function to remove markers already placed in map */
	function removeMarker(id){
		for(var i = 0; i < markers.length; i++){
			if(markers[i].id === id){
				map.removeLayer(markers[i].markerObj);
				markers.splice(markers[i], 1);
			}
		}
	}			

});
