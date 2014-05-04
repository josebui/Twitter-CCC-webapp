
var completeData = null;
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

		completeData = [];
		for (var i=0;i<data.rows.length;i++)
		{	 
			var time = data.rows[i].value[0];
			var date = parseDate(time,10);
			var day = date.day; //time.substring(0, 3);
			var hour = date.hour;// time.substring(11, 13);
			
			var point = new google.maps.LatLng(data.rows[i].geometry.coordinates[1], data.rows[i].geometry.coordinates[0]);

			completeData.push({
				day: day,
				hour: hour,
				position: point,
				id: data.rows[i].id
			});

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

	var heatMapData = updateHeatMapData();
	if(!heatMapData){
		return;
	}

	var pointArray = null;
	var selectedData = null;
	if(day && hour && heatMapData['byDayTime'][day] && heatMapData['byDayTime'][day][hour] ){
		selectedData = heatMapData['byDayTime'][day][hour];
		// pointArray = new google.maps.MVCArray(heatMapData['byDayTime'][day][hour].points);
	}else if(hour && heatMapData['byTime'][hour]){
		selectedData = heatMapData['byTime'][hour];
		// pointArray = new google.maps.MVCArray(heatMapData['byTime'][hour].pointd);
	}else if(day && heatMapData['byDay'][day]){
		selectedData = heatMapData['byDay'][day];
		// pointArray = new google.maps.MVCArray(heatMapData['byDay'][day].points);
	}else{
		return;
	}

	pointArray = new google.maps.MVCArray(selectedData.points);

	if(day){
		$('.day[value="'+day+'"]').addClass('btn-success');
	}
	if(hour){
		$('.hour[value="'+hour+'"]').addClass('btn-success');
	}

	heatMap = new google.maps.visualization.HeatmapLayer({
		data: pointArray,
		radius: 15,
		// dissipating: false
	});

	heatMap.setMap(map);

	updateTweetsText(selectedData.ids);
}

function updateHeatMapData(){
	var heatMapData = {
		'byDay': [],
		'byTime': [],
		'byDayTime':[]
	};
	if(!completeData){
		return null;
	}
	for (var i = completeData.length - 1; i >= 0; i--) {
		var element = completeData[i];
		var hour = element.hour;
		var day = element.day;
		var point = element.position;

		if(boundsRec && !boundsRec.getBounds().contains(point)){
			continue;
		}

		if(!heatMapData['byTime'][hour]){
			heatMapData['byTime'][hour] = {
				points:[],
				ids:[]
			};
		}
		heatMapData['byTime'][hour].points.push(point);
		heatMapData['byTime'][hour].ids.push(element.id);

		if(!heatMapData['byDay'][day]){
			heatMapData['byDay'][day] = {
				points:[],
				ids:[]
			};
		}
		heatMapData['byDay'][day].points.push(point);
		heatMapData['byDay'][day].ids.push(element.id);

		if(!heatMapData['byDayTime'][day]){
			heatMapData['byDayTime'][day] = {
				points:[],
				ids:[]
			};
		}

		if(!heatMapData['byDayTime'][day][hour]){
			heatMapData['byDayTime'][day][hour] = {
				points:[],
				ids:[]
			};
		}
		heatMapData['byDayTime'][day][hour].points.push(point);
		heatMapData['byDayTime'][day][hour].ids.push(element.id);
	};

	return heatMapData;
}

function updateTweetsText(tweetsIds){
	// TODO http://115.146.95.26:5984/geomelbourne/_design/data/_view/text?keys=["457019701592588288","457027394574905344"]
	$('.tweets').html('');
	var len = ((tweetsIds.length-1) > 10)?10:(tweetsIds.length-1);
	for (var i = len; i >= 0; i--) {
		$.getJSON('http://115.146.95.26:5984/geomelbourne/'+tweetsIds[i], 
		function(data) {
			if($('.tweets .list-group-item[tweetid="'+data.id+'"]').length == 0){
				$('.tweets').append('<li style="font-size:11px;" class="list-group-item" tweetid="'+data.id+'"><span class="label label-default">'+data.created_at+'</span>&nbsp;&nbsp;'+data.text+'</li>');
			}
		});
	};
	
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
    draggable: true,
    fillOpacity: 0.08
  });

  boundsRec.setMap(map);
  google.maps.event.addListener(boundsRec, 'bounds_changed', updateBounds);
}

function updateBounds(){
	// var ne = boundsRec.getBounds().getNorthEast();
 //  	var sw = boundsRec.getBounds().getSouthWest();
 //  	bounds =sw.lng()+','+sw.lat()+','+ne.lng()+','+ne.lat();
 //  	loadData(type,bounds);
 	addHeatMap();
}

function getTypesCount(){
	var ne = boundsRec.getBounds().getNorthEast();
 	var sw = boundsRec.getBounds().getSouthWest();
 	var bounds =sw.lng()+','+sw.lat()+','+ne.lng()+','+ne.lat();
	$.getJSON('http://115.146.95.26:5984/geomelbourne/_design/geo/_spatial/happy?bbox='+bounds+'&count=true', 
	function(dataHappy) {
		$.getJSON('http://115.146.95.26:5984/geomelbourne/_design/geo/_spatial/sad?bbox='+bounds+'&count=true', 
		function(dataSad) {
			drawTable(dataHappy,dataSad);
		});
		
	});
}

function drawTable(dataHappy,dataSad){
	var table = new google.visualization.DataTable();
    
    table.addColumn('string', 'Mood');
    table.addColumn('number', 'Tweets');

    // for(var i=0;i<data.rows.length; i++){
        table.addRow();
        table.setValue(0,0, 'positive');
        table.setValue(0,1, dataHappy.count);

        table.addRow();
        table.setValue(1,0, 'negative');
        table.setValue(1,1, dataSad.count);
    // }
  
    var options = {
      title: '',
      hAxis: {title: 'Mood'},
      width: '90%', 
      height: 500,
      vAxis: {maxValue: 2}
     
    };


  	var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
  	chart.draw(table,options);
} 

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function parseTwitterDate(aDate)
{   
  return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
  //sample: Wed Mar 13 09:06:07 +0000 2013 
}
function parseDate(str,timeDiff) {
	var date = new Date(str);
	date.setHours(date.getHours() + timeDiff);
	var text = date.toUTCString();
	return {
		day: text.substring(0,3),
		hour: text.substring(17,19)
	};

    // var v=str.split(' ');
    // return new Date(Date.parse(v[1]+" "+v[2]+", "+v[5]+" "+v[3]+" UTC"));
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
		zoom: 9,
	    center: new google.maps.LatLng(-37.793472,144.995804),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	loadData(type,bounds);

	$('.hour').click(function(){
		hour = $(this).attr("value");
		if(hour == 'None'){
			hour = null;
		}
		addHeatMap();
	});

	$('.day').click(function(){
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