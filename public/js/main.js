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
			searchAddressByCoords([sendData.lat, sendData.lng], function(adress){
				$mypos.val('adress');
			});

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

	$form.on('submit', function(e){
		e.preventDefault();
		var destiny = $destiny.val();
		searchAddressByString(destiny);
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
		    	var adressArray = results[0].formatted_address.split(" ");
		    	var adress= "" ;
		    	//  i could extend string object to concatenate splitted objects like this one
		    	for(var i = 0; i < 4; i ++){
		    		adress += adressArray[i] + " ";
		    	}

	    		$mypos.val(adress);
		    }
		  }
		});		
	}


	// search address by string
	function searchAddressByString(addressString){
		GMaps.geocode({
		  address: addressString + "Bogota, Colombia",
		  callback: function(results, status) {
		    if (status === 'OK') {
		    	console.log(results[0]);
		    	if(searchByValue('myDestiny', 'id', map.markers)){
						map.markers[1].setPosition({
							lat: results[0].geometry.location.k,
							lng: results[0].geometry.location.A
						});
		    	}else{
    				createMarker(results[0].geometry.location.k, results[0].geometry.location.A, 'myDestiny');
		    	}	    		
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
				marker.markerObj = map.addMarker({lat:connections[i].lat, lng:connections[i].lng});
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

			if(distance <= 2000 ){

				// push user id, lat and lng to closestConnections
				closestConnections.push(connections[i]);
			} 
		}

		// emit event to people near me
		socket.emit('closest:people', closestConnections);
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

});
