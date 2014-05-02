$(document).ready(function(){

	function initialize() {
		var map;

	var heatData = [];
	  var mapOptions = {
	    zoom: 10,
	    center: new google.maps.LatLng(-37.793472,144.995804),
	    mapTypeId: google.maps.MapTypeId.SATELLITE
	  };

	  map = new google.maps.Map(document.getElementById('map-canvas'),
	      mapOptions);

	  $.getJSON('http://115.146.95.26:5984/geomelbourne/_design/geo/_spatial/happy?bbox=144.3945,-38.2607,145.7647,-37.4598', 
		function(data) {

			for (var i=0;i<data.rows.length;i++)
			{	 
				heatData.push(new google.maps.LatLng(data.rows[i].geometry.coordinates[1], data.rows[i].geometry.coordinates[0]));
			}
			// console.log(heatData);
			var pointArray = new google.maps.MVCArray(heatData);

			  heatmap = new google.maps.visualization.HeatmapLayer({
			    data: pointArray,
			    radius: 20,
			    // dissipating: false
			  });

			  heatmap.setMap(map);
		});

	  
	}

	function toggleHeatmap() {
	  heatmap.setMap(heatmap.getMap() ? null : map);
	}

	function changeGradient() {
	  var gradient = [
	    'rgba(0, 255, 255, 0)',
	    'rgba(0, 255, 255, 1)',
	    'rgba(0, 191, 255, 1)',
	    'rgba(0, 127, 255, 1)',
	    'rgba(0, 63, 255, 1)',
	    'rgba(0, 0, 255, 1)',
	    'rgba(0, 0, 223, 1)',
	    'rgba(0, 0, 191, 1)',
	    'rgba(0, 0, 159, 1)',
	    'rgba(0, 0, 127, 1)',
	    'rgba(63, 0, 91, 1)',
	    'rgba(127, 0, 63, 1)',
	    'rgba(191, 0, 31, 1)',
	    'rgba(255, 0, 0, 1)'
	  ]
	  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
	}

	function changeRadius() {
	  heatmap.set('radius', heatmap.get('radius') ? null : 20);
	}

	function changeOpacity() {
	  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
	}

	google.maps.event.addDomListener(window, 'load', initialize);
});