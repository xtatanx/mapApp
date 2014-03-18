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

	/* find user */
	map.locate({setView:true, maxZoom:16});

});
