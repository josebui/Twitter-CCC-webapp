google.load("visualization", "1.1", {packages:["corechart"]});

var completeData = null;
var map = null;
var heatMap = null;
var day = null;
var hour = null;
var lang = null;
var boundsRec = null;
var type = "happy";
var mood = [-100,100];
var langCodes = [];

// Charts
var dayFrequencies = [];
var hourFrequencies = [];
var langFrequencies = [];
var moodFrequencies = [];

function loadData(url,bounds,onSucess){

	// Set ui
	$('.hour, .day, .lang, .type button, .type a').removeClass('btn-success');

	removeHeatMap();

	$('.loader').show();

	langCodes = [];

	// Load
	// $.getJSON(requestUrl+'/_design/geo/_spatial/'+type+'?bbox='+bounds, 
	$.getJSON(url, 
	function(data) {
		$('.loader').hide();
		onSucess(data);

		completeData = [];
		for (var i=0;i<data.rows.length;i++)
		{	 
			var time = data.rows[i].value[0];
			var lang = data.rows[i].value[1];
			var date = parseDate(time,10);
			var day = date.day; //time.substring(0, 3);
			var hour = date.hour;// time.substring(11, 13);
			var mood = (data.rows[i].value[3])?data.rows[i].value[3]:0;

			if(langCodes.indexOf(lang) == -1){
				langCodes.push(lang);
			}
			
			var point = new google.maps.LatLng(data.rows[i].value[2].coordinates[1], data.rows[i].value[2].coordinates[0]);

			completeData.push({
				day: day,
				hour: hour,
				position: point,
				id: data.rows[i].id,
				lang: lang,
				mood: parseFloat(mood)
			});

		}
		updateLangFilter();
		addHeatMap();
	});
}

function updateLangFilter(){
	$('.lang-list').html('');
	$('.lang-list').append('<button type="button" class="lang none btn btn-default" value="none">None</button>');
	for (var i = 0; i < langCodes.length; i++) {
	 	$('.lang-list').append('<button type="button" class="lang btn btn-default" value="'+langCodes[i]+'">'+langCodes[i]+'</button>');
	};

	$('.lang').click(function(){
		lang = $(this).attr("value");
		if(lang == 'none'){
			lang = null;
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
	$('.hour, .day, .lang, .mood').removeClass('btn-success');

	var heatMapData = updateHeatMapData(day,hour,lang,mood);
	if(!heatMapData){
		return;
	}

	var pointArray = null;

	pointArray = new google.maps.MVCArray(heatMapData.points);

	if(day){
		$('.day[value="'+day+'"]').addClass('btn-success');
	}
	if(hour){
		$('.hour[value="'+hour+'"]').addClass('btn-success');
	}
	if(lang){
		$('.lang[value="'+lang+'"]').addClass('btn-success');	
	}
	if(mood){
		$('.mood[value="'+mood[0]+'|'+mood[1]+'"]').addClass('btn-success');	
	}

	heatMap = new google.maps.visualization.HeatmapLayer({
		data: pointArray,
		radius: 15,
		// dissipating: false
	});

	heatMap.setMap(map);

	updateTweetsText(heatMapData.ids);
}

function updateHeatMapData(paramDay,paramHour,paramLang,paramMood){

	var heatMapData = {
		points:[],
		ids:[]
	}
	if(!completeData){
		return null;
	}
	clearFrequencies();
	for (var i = completeData.length - 1; i >= 0; i--) {
		var element = completeData[i];
		var hour = element.hour;
		var day = element.day;
		var point = element.position;

		if(paramDay){
			if(paramDay != day){
				continue;
			}
		}

		if(paramHour){
			if(paramHour != hour){
				continue;
			}
		}

		if(paramLang){
			if(paramLang != element.lang){
				continue;
			}
		}

		if(paramMood){
			if(element.mood < paramMood[0] || element.mood > paramMood[1]){
				continue;
			}
		}

		if(!getBounds().contains(point)){
			continue;
		}

		addFrequency(element);

		heatMapData.points.push(point);
		heatMapData.ids.push(element.id)
	};

	drawCharts();

	return heatMapData;
}

function updateTweetsText(tweetsIds){
	// TODO http://115.146.95.26:5984/geomelbourne/_design/data/_view/text?keys=["457019701592588288","457027394574905344"]
	$('.tweets').html('');
	var len = ((tweetsIds.length-1) > 10)?10:(tweetsIds.length-1);
	for (var i = len; i >= 0; i--) {
		$.getJSON(requestUrl+'/'+tweetsIds[i], 
		function(data) {
			if($('.tweets .list-group-item[tweetid="'+data.id+'"]').length == 0){
				var li = $('<li data-toggle="tooltip" title="'+data.user.screen_name+'" style="font-size:11px;" class="list-group-item" tweetid="'+data.id+'"><span class="label label-default">'+data.created_at+'</span>&nbsp;&nbsp;'+data.text+'</li>').appendTo('.tweets');
				li.tooltip({});
				li.click(function(event){
					window.open('http://twitter.com/'+data.user.screen_name, '_blank');
					event.preventDefault();
				});
			}
		});
	};
	
}

function getBounds(){
	if(boundsRec){
		return boundsRec.getBounds();
	}else{
		return map.getBounds();
	}
}

function addSelectionRectangle(){
	var mapBounds = map.getBounds();
	var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(mapBounds.getSouthWest().lat(),mapBounds.getSouthWest().lng()),
      new google.maps.LatLng(mapBounds.getNorthEast().lat(),mapBounds.getNorthEast().lng())
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
  updateBounds();
}

function removeSelectionRectangle(){
	if(boundsRec){
		boundsRec.setMap(null);
		boundsRec = null;
		updateBounds();
	}
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
	$.getJSON(requestUrl+'/_design/geo/_spatial/happy?bbox='+bounds+'&count=true', 
	function(dataHappy) {
		$.getJSON(requestUrl+'/_design/geo/_spatial/sad?bbox='+bounds+'&count=true', 
		function(dataSad) {
			drawTable(dataHappy,dataSad);
		});
		
	});
}

function clearFrequencies(){
	hourFrequencies = [];
	// for (var i = 1; i < 23; i++) {
	// 	hourFrequencies[(i<10)?("0"+i.toString()):(i.toString())] = 0;
	// };
	
	dayFrequencies = [];
	var day = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
	for (index = 0; index < day.length; ++index) {
	    dayFrequencies[day[index]] = 0;
	}

	langFrequencies = [];

	moodFrequencies = [];
	var moodRanges = ["-100,-50","-50,0","0,0","0,50","50,100"];
	for (index = 0; index < moodRanges.length; ++index) {
	    moodFrequencies[moodRanges[index]] = 0;
	}
	
}

function addFrequency(element){
	if(!dayFrequencies[element.day]){
		dayFrequencies[element.day] = 0;
	}
	dayFrequencies[element.day]++;

	var hour = parseInt(element.hour);
	if(!hourFrequencies[hour]){
		hourFrequencies[hour] = 0;
	}
	hourFrequencies[hour]++;

	if(!langFrequencies[element.lang]){
		langFrequencies[element.lang] = 0;
	}
	langFrequencies[element.lang]++;

	if(!moodFrequencies[classifyMood(element.mood)]){
		moodFrequencies[classifyMood(element.mood)] = 0;
	}
	moodFrequencies[classifyMood(element.mood)]++;
}

function classifyMood(mood){
	var ranges = {
		"-100,-50":[-100,-50],
		"-50,0":[-50,-0.00001],
		"0,0":[0,0],
		"0,50":[0.00001,50],
		"50,100":[50,100]
	};
	for (range in ranges) {
		if(mood >= ranges[range][0] && mood <= ranges[range][1] ){
			return range;
		}
	}
	return "no-range";
}

function drawCharts(){
	drawTable(dayFrequencies,"Tweets by day","day-chart");
	drawTable(hourFrequencies,"Tweets by hour","hour-chart");
	drawTable(langFrequencies,"Tweets by lang","lang-chart");
	drawTable(moodFrequencies,"Tweets by mood","mood-chart");
}

function drawTable(frequencies,title,divId){
	var table = new google.visualization.DataTable();
    
    table.addColumn('string', title);
    table.addColumn('number', 'Tweets');

    var cont = 0;
    for (key in frequencies) {
    	if(divId == "lang-chart" && !$('#show-english').is(':checked') && key == 'en'){
    		continue;
    	}
    	table.addRow();
        table.setValue(cont,0, key);
        table.setValue(cont++,1, frequencies[key]);
    }

    // for(var i=0;i<data.rows.length; i++){
        // table.addRow();
        // table.setValue(0,0, 'positive');
        // table.setValue(0,1, dataHappy.count);

        // table.addRow();
        // table.setValue(1,0, 'negative');
        // table.setValue(1,1, dataSad.count);
    // }
  
    var options = {
      title: '',
      hAxis: {title: title},
      width: '98%', 
      height: 500,
      vAxis: {maxValue: 2}
     
    };


  	var chart = new google.visualization.ColumnChart(document.getElementById(divId));
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
	    center: new google.maps.LatLng(mapCenter[0],mapCenter[1]),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	google.maps.event.addListener(map, 'bounds_changed', updateBounds);

	loadData(requestUrl+'/_design/geo/_view/mood?key="'+type+'"',bounds,function(data){
		$('.type button[value="'+type+'"]').addClass('btn-success');
	});

	$('.hour').click(function(){
		hour = $(this).attr("value");
		if(hour == 'none'){
			hour = null;
		}
		addHeatMap();
	});

	$('.day').click(function(){
		day = $(this).attr("value");
		if(day == 'none'){
			day = null;
		}
		addHeatMap();
	});

	$('.mood').click(function(){
		mood = $(this).attr("value");
		if(mood == 'none'){
			mood = null;
		}else{
			mood = mood.split("|");
			mood = [parseFloat(mood[0]),parseFloat(mood[1])];
		}
		addHeatMap();
	});

	$('.type button, .type a').click(function(event){
		var button = $(this);
		type= $(this).attr('value');
		if($(this).hasClass("footy")){
			if (typeof type == 'undefined' || type == false) return;
			button.removeClass('btn-success');
			var url = requestUrl+'/_design/geo/_view/footy?startkey=["footy","'+type+'"]&endkey=["footy","'+type+'"]'; 
			if(type == 'all'){
				url = requestUrl+'/_design/geo/_view/footy'; 
			}

			loadData(url,bounds,function(data){
				button.addClass('btn-success');
			});	
		}else{
			button.removeClass('btn-success');
			loadData(requestUrl+'/_design/geo/_view/mood?key="'+type+'"',bounds,function(data){
				button.addClass('btn-success');
			});	
		}
		
		event.preventDefault();
	});

	$('button.bounds-box').click(function(event){
		var label = $(this).text();
		if(label == 'Hide bounds box'){
			removeSelectionRectangle();
			$(this).text('Show bounds box');
		}else{
			addSelectionRectangle();	
			$(this).text('Hide bounds box');
		}
		event.preventDefault();
	});

	$('#show-english').change(function(){
		drawCharts();
	});
});