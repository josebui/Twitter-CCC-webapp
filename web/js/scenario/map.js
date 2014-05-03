var heatData = {
	'byDay': [],
	'byTime': []
};
var heatMap = null;

function loadData(type,bounds){

	// Set ui
	$('.hour, .day').removeClass('btn-success');

	if(heatMap){
		heatMap.setMap(null);
	}

	$('.loader').show();

	$('.type button').removeClass('btn-success');
	$('.type button[value="'+type+'"]').addClass('btn-success');

	// Load
	$.getJSON('http://115.146.95.26:5984/geomelbourne/_design/geo/_spatial/'+type+'?bbox='+bounds, 
	function(data) {
		$('.loader').hide();
		for (var i=0;i<data.rows.length;i++)
		{	 
			var time = data.rows[i].value[0];
			var day = time.substring(0, 3);
			var hour = time.substring(11, 13);
			
			var point = new google.maps.LatLng(data.rows[i].geometry.coordinates[1], data.rows[i].geometry.coordinates[0]);

			if(!heatData['byTime'][hour]){
				heatData['byTime'][hour] = [];
			}
			heatData['byTime'][hour].push(point);

			if(!heatData['byDay'][day]){
				heatData['byDay'][day] = [];
			}
			heatData['byDay'][day].push(point);

		}
		console.log(heatData);
		
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


$(document).ready(function(){

	
	
	var map = null;


	var mapOptions = {
		zoom: 10,
	    center: new google.maps.LatLng(-37.793472,144.995804),
	    mapTypeId: google.maps.MapTypeId.SATELLITE
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	loadData("happy","144.3945,-38.2607,145.7647,-37.4598");

	$('.hour').hover(function(){

		$('.hour, .day').removeClass('btn-success');
		$(this).addClass('btn-success');
		var hour = $(this).text();
		var pointArray = new google.maps.MVCArray(heatData['byTime'][hour]);

		if(heatMap != null){
			heatMap.setMap(null);
		}

	  heatMap = new google.maps.visualization.HeatmapLayer({
	    data: pointArray,
	    radius: 20,
	    // dissipating: false
	  });

	  heatMap.setMap(map);

	});

	$('.day').hover(function(){

		$('.hour, .day').removeClass('btn-success');
		$(this).addClass('btn-success');
		var day = $(this).text();
		var pointArray = new google.maps.MVCArray(heatData['byDay'][day]);

		if(heatMap != null){
			heatMap.setMap(null);
		}

	  heatMap = new google.maps.visualization.HeatmapLayer({
	    data: pointArray,
	    radius: 20,
	    // dissipating: false
	  });

	  heatMap.setMap(map);

	});

	$('.type button').click(function(event){
		var value = $(this).attr('value');
		loadData(value,"144.3945,-38.2607,145.7647,-37.4598");
		event.preventDefault();
	});

});