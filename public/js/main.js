 $(function(){
	// CACHE SOME VARIABLES
	var sendData = {
		lat:0,
		lng:0,
		address: 'string'
	}

	// reference to my destiny
	var destiny = {
		lat:0,
		lng:0,
		address: 'string'
	}
	// host that socket use to connect 
	var host = location.origin.replace(/^http/, 'ws');

	// reference to the socket
	var socket;

	// handle connections and id's except mine
	connections = [];

	// store markers currently placed in the map
	var markers = [];

	// store the closest conenctions to my position
	var closestConnections = [];

	// reference to my position input
	var $mypos = $('#mypos');

	//  reference to destiny input
	var $destiny = $('#destiny');

	//  reference to geosearch form
	var $form = $('#geoSearch_form');

	// reference to search people btn
	var $search_btn = $("#search_people");

	// create a map in the "map" div, set the view to Bogota
	window.map = new GMaps({
	  div: '#map',
	  lat: 4.596974,
	  lng: -74.072978,
	  zoom: 15
	});


	// to radians
	if (typeof (Number.prototype.toRad) === "undefined") {
	    Number.prototype.toRad = function() {
	        return this * 3.14 / 180;
	    }
	}	

	// geolocate the conenction and place marker in the map
	GMaps.geolocate({
	  success: function(position) {
	  	// store data to send to other sockets
			sendData.lat = position.coords.latitude;
			sendData.lng = position.coords.longitude;

			// center map in current lat and ln
			map.setCenter(sendData.lat, sendData.lng);

			// create marker on client position
			createMarker(sendData.lat, sendData.lng);

			// search for my adress and place it in the input 'tu ubicacion'
			searchAddressByCoords([sendData.lat, sendData.lng]);

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


	// search people near me
	$search_btn.on('click', searchPeople);

	// Handle form submission
	$form.on('submit', function(e){
		e.preventDefault();
		var destiny = $destiny.val();
		var myPos = $mypos.val();
		searchAddressByString(destiny, 'myDestiny');
		searchAddressByString(myPos, 'myPosition');
	});

	// harvesina formula to calculate distances betwen point a and b
	function calcDistance(point1, point2){
		var lat2 = point1[0]; 
		var lon2 = point1[1]; 
		var lat1 = point2[0]; 
		var lon1 = point2[1]; 

		var R = 6371; // radius of earth in km 

		var x1 = lat2-lat1;
		var dLat = x1.toRad();  
		var x2 = lon2-lon1;
		var dLon = x2.toRad();  
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);  
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		// show number in meters
		var d = Math.floor((R * c) * 1000); 
		return d; 
	}

	// search for address by coordinates and place it in input my position
	function searchAddressByCoords(adress){
		GMaps.geocode({
		  lat: adress[0],
		  lng: adress[1],
		  callback: function(results, status) {
		    if (status === 'OK') {
		    	console.log(results);
		    	var adressArray = results[0].formatted_address.split(" ");
		    	var adress= "" ;
		    	//  i could extend string object to concatenate splitted objects like this one
		    	for(var i = 0; i < 4; i ++){
		    		adress += adressArray[i] + " ";
		    	}
		    	sendData.address = adress;
	    		$mypos.val(adress);
		    }
		  }
		});		
	}


	// search address by string
	function searchAddressByString(addressString, typeOfMarker){
		GMaps.geocode({
		  address: addressString + " Bogota, Colombia",
		  callback: function(results, status) {
		  	console.log(results);
		  	// check the type of marker and update its position every time the form is submitted
		    if (status === 'OK' && typeOfMarker === 'myDestiny') {
		    	if(searchByValue('myDestiny', 'id', map.markers)){

						setMarkerPosition('myDestiny', results[0].geometry.location.k, results[0].geometry.location.A, map.markers);

		    	}else{
    				createMarker(results[0].geometry.location.k, results[0].geometry.location.A, 'myDestiny');
		    	}
					
					// my destiny data in string adress and also coordinates
					destiny.lat = results[0].geometry.location.k;
					destiny.lng = results[0].geometry.location.A;
					destiny.address = results[0].formatted_address;

					// pan to myDestiny marker
		    	map.setCenter(results[0].geometry.location.k, results[0].geometry.location.A);
		    		    		
		    }else if (status === 'OK' && typeOfMarker === 'myPosition'){
		    	if(searchByValue('myPosition', 'id', map.markers)){

						setMarkerPosition('myPosition', results[0].geometry.location.k, results[0].geometry.location.A, map.markers);
		    	}else{

    				createMarker(results[0].geometry.location.k, results[0].geometry.location.A, 'myPosition');
		    	}

		    	// client data in string adress and also coordinates
		    	sendData.lat = results[0].geometry.location.k;
		    	sendData.lng = results[0].geometry.location.A;
		    	sendData.address = results[0].formatted_address;

		    	socket.emit('changed:coords', sendData);		    	
		    }
		  }
		});		
	}	


	// helper function for creating markers
	function createMarker(lat, lng, typeOfMarker){
		var id = (typeof(typeOfMarker)) === 'string' ? 'myDestiny' : 'myPosition';
		map.addMarker({
		  lat: lat,
		  lng: lng,
		  id: id
		});
	}

	

	// set  initial  markers 
	function setMarkers(connections){
		for(var i = 0; i < connections.length; i++){
			var marker={}
			marker.id = connections[i].id;
			if(!searchByValue(marker, 'id', markers)){
				markers.push(marker);
				marker.markerObj = map.addMarker({
					lat:connections[i].lat, 
					lng:connections[i].lng,
					id: connections[i].id
				});
			}
		}
	}


	// check if property value exist  in an array of objects
	function searchByValue(value, property, array){
		for(var i = 0; i < array.length; i++){
			if(array[i][property] === value){
				return true;
			}
		}
		return false;
	}


	// function to connect the socket
	function createConnection(){

		// if The client support sockets create a connection 
		if(Modernizr.websockets){
			// client socket 
			socket = io.connect(host);

			socket.emit('send:coords', sendData);

			socket.on('load:coords', function(data){
				// add data as a new connection
				connections.push(data);
				setMarkers(connections);
			});

			socket.on('update:coords', function(data){
				// update array of connected sockets with the new position
				for (var i = 0; i < connections.length; i++){
					if(connections[i].id === data.id){
						connections[i].lat = data.lat;
						connections[i].lng = data.lng;
						connections[i].address = data.address;
					}
				}

				// set the marker changed to its new position
				setMarkerPosition(data.id, data.lat, data.lng, map.markers);	 
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

	// function to search people near me
	function searchPeople(){
		var myPosition = [sendData.lat, sendData.lng]
		for(var i = 0; i < connections.length; i++){
			var otherPosition = [connections[i].lat, connections[i].lng];
			// distance betwen my position and someone else's position
			var distance = calcDistance(myPosition, otherPosition);

			if(distance <= 500 ){
				// push user id, lat and lng to closestConnections
				closestConnections.push(connections[i]);
			} 
		}

		// emit event to people near me
		socket.emit('closest:people', {
			targets: closestConnections,
			myAdress:sendData,
			myDestiny:destiny
		});
		// after emit event closest connections return to 0
		closestConnections = [];
	}

	//  this function remove  connections disconnected based on socket id 
	function removeConnection(id){
		for(var i = 0; i < connections.length; i++){
			if(connections[i].id == id){
				// delete connection located in i index in connections
				connections.splice(i, 1);
			}
		}
	}

	// function to remove markers already placed in map
	function removeMarker(id){
		for(var i = 0; i < markers.length; i++){
			if(markers[i].id === id){
				map.removeMarker(markers[i].markerObj);
				// delete marker located in i index in markers
				markers.splice(i, 1);
			}
		}
	}

	// change the position of a given marker id 
	function setMarkerPosition(markerId, lat, lng, array){
		for(var i = 0; i < array.length; i++){
			if(map.markers[i].id === markerId){
				map.markers[i].setPosition({
					lat: lat,
					lng: lng
				});
			}
		}
	}		

});
