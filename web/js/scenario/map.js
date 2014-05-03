var heatData = null;
var map = null;
var heatMap = null;
var day = null;
var hour = null;
var boundsRec = null;
var type = "happy";
var bounds = "144.3945,-38.2607,145.7647,-37.4598";

function loadData(type,bounds){

	// Set ui
	$('.hour, .day').removeClass('btn-success');

	removeHeatMap();

	$('.loader').show();

	$('.type button').removeClass('btn-success');
	$('.type button[value="'+type+'"]').addClass('btn-success');

	// Load
	$.getJSON('http://115.146.95.26:5984/geomelbourne/_design/geo/_spatial/'+type+'?bbox='+bounds, 
	function(data) {
		$('.loader').hide();
		heatData = {
			'byDay': [],
			'byTime': [],
			'byDayTime':[]
		};
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

			if(!heatData['byDayTime'][day]){
				heatData['byDayTime'][day] = [];
			}

			if(!heatData['byDayTime'][day][hour]){
				heatData['byDayTime'][day][hour] = [];
			}
			heatData['byDayTime'][day][hour].push(point);


		}
		addHeatMap();
	});
}

function removeHeatMap(){
	if(heatMap != null){
		heatMap.setMap(null);
	}
}

function addHeatMap(){
	removeHeatMap();
	$('.hour, .day').removeClass('btn-success');

	var pointArray = null;
	if(day && hour && heatData['byDayTime'][day] && heatData['byDayTime'][day][hour] ){
		pointArray = new google.maps.MVCArray(heatData['byDayTime'][day][hour]);
	}else if(hour && heatData['byTime'][hour]){
		pointArray = new google.maps.MVCArray(heatData['byTime'][hour]);
	}else if(day && heatData['byDay'][day]){
		pointArray = new google.maps.MVCArray(heatData['byDay'][day]);
	}else{
		return;
	}

	if(day){
		$('.day[value="'+day+'"]').addClass('btn-success');
	}
	if(hour){
		$('.hour[value="'+hour+'"]').addClass('btn-success');
	}

	heatMap = new google.maps.visualization.HeatmapLayer({
		data: pointArray,
		radius: 20,
		// dissipating: false
	});

	heatMap.setMap(map);
}

function addSelectionRectangle(){
	var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-38.2607,144.3945),
      new google.maps.LatLng(-37.4598,145.7647)
  );

  // Define the rectangle and set its editable property to true.
  boundsRec = new google.maps.Rectangle({
    bounds: bounds,
    editable: true,
    draggable: true
  });

  boundsRec.setMap(map);
  google.maps.event.addListener(boundsRec, 'bounds_changed', updateBounds);
}

function updateBounds(){
	var ne = boundsRec.getBounds().getNorthEast();
  	var sw = boundsRec.getBounds().getSouthWest();
  	bounds =sw.lng()+','+sw.lat()+','+ne.lng()+','+ne.lat();
  	loadData(type,bounds);
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

	var mapOptions = {
		zoom: 10,
	    center: new google.maps.LatLng(-37.793472,144.995804),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	loadData(type,bounds);

	$('.hour').hover(function(){
		hour = $(this).attr("value");
		if(hour == 'None'){
			hour = null;
		}
		addHeatMap();
	});

	$('.day').hover(function(){
		day = $(this).attr("value");
		if(day == 'None'){
			day = null;
		}
		addHeatMap();
	});

	$('.type button').click(function(event){
		type= $(this).attr('value');
		loadData(type,bounds);
		event.preventDefault();
	});

	addSelectionRectangle();

});