$(function(){
	// CACHE SOME VARIABLES
	var sendData = {
		lat:0,
		lng:0
	}

	// host that socket use to connect 
	var host = location.origin.replace(/^http/, 'ws');

	// reference to the socket
	var socket;

	// handle connections and id's except mine
	var connections = [];

	// store markers currently placed in the map
	var markers = [];

	// store the closest conenctions to my position
	var closestConnections = [];

	// create a map in the "map" div, set the view to Bogota
	var map = new GMaps({
	  div: '#map',
	  lat: 4.596974,
	  lng: -74.072978,
	  zoom: 15
	});

	// geolocate the conenction and place amrker in the map
	GMaps.geolocate({
	  success: function(position) {
	  	// store data to send to other sockets
			sendData.lat = position.coords.latitude;
			sendData.lng = position.coords.longitude;

			// center map in current lat and ln
			map.setCenter(sendData.lat, sendData.lng);

			// create marker on client position
			createMarker(sendData.lat, sendData.lng);

			// initialize a socket connection 
			createConnection();
	  },
	  error: function(error) {
	    alert('Geolocation failed: '+error.message);
	  },
	  not_supported: function() {
	    alert("Your browser does not support geolocation");
	  }
	});	

	// reference to my position input
	var $mypos = $('#mypos');
	//  reference to geosearch form
	var $form = $('#geoSearch_form');


	// search peopl enear me
	$('#search_people').on('click', searchPeople);

	$form.on('submit', function(e){
		e.preventDefault();
		var adress = $mypos.val();

		parseAdress(adress, searchAdress);

	});

	function parseAdress(adress, callback){
		// parse adress to send right parameters
		console.log('parsing adress: ' + adress);

		if(callback && typeof(callback) === 'function'){
			callback(adress);
		}
	}

	function searchAdress(adress){
		$.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + 4.754149 + '&lon='+ -74.047145 +'&addressdetails=1' , function(data) {
			console.log(data);
		});
	}

	// helper function for creating markers
	function createMarker(lat, lng){
		map.addMarker({
		  lat: lat,
		  lng: lng
		});
	}

	// set  initial markers markers 
	function setMarkers(connections){
		for(var i = 0; i < connections.length; i++){
			var marker={}
			marker.id = connections[i].id;
			if(!markerInArray(marker, markers)){
				markers.push(marker);
				marker.markerObj = map.addMarker({lat:connections[i].lat, lng:connections[i].lng});
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


	/* function to connect the socket*/
	function createConnection(){

		/* if The client support sockets create a connection */
		if(Modernizr.websockets){
			/* client socket */
			socket = io.connect(host);

			socket.emit('send:coords', sendData);

			socket.on('load:coords', function(data){
				// add data as a new connection
				connections.push(data);
				setMarkers(connections);
			});

			socket.on('alert:msg', function(message){
				alert(message);
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
			if(distance <= 1000){
				// push user id, lat and lng to closestConnections
				closestConnections.push(connections[i]);
			} 
		}
		console.log(closestConnections);
		socket.emit('closest:people', closestConnections);
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
				map.removeMarker(markers[i].markerObj);
				// delete marker located in i index in markers
				markers.splice(i, 1);
			}
		}
	}		

});
