/*Style for layers*/

	var stylelayer={
		defecto:{
			color: "red",
			opacity: 1,
			fillcolor:"red",
			fillOpacity:0.1,
			weight: 0.5
		}
		,
		reset:{
			color: "red",
			opacity: 0.4,
			weight: 1
		}
		,
		highlight:{
			weight: 5,
			color: '#0D8BE7',
			dashArray: '',
			fillOpacity: 0.7
		}
		,
		selected:{
			color: "blue",
			opacity: 0.3,
			weight: 0.5
		}

	}

	var map = L.map('map').setView([17.6868,83.2185], 7);

	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


	var placenames = new Array();
	var zipcodes = new Object();
	//$.getJSON( '/getAjaxProducts', null,
	// function ( jsonData )
	//{
	$.each(statesData.features, function ( index, feature )
	{
		var name=`${feature.properties.gp_name} ${feature.properties.vcode11}  `
		placenames.push(name);
		zipcodes[name] = feature.properties.vcode11;
	} );

	/* area de busqueda */


	$('#places').typeahead({
	 source:placenames,
	   afterSelect: function(b) {
               redraw(b)
     	} 
	});

	var arrayBounds = [];
	function redraw(b){
		
		 geojson.eachLayer(function(layer) {
               if(layer.feature.properties.vcode11==zipcodes[b]){
               		selectTypeaheadFeature(layer)
               		
               		
               }
         })

	}



	var geojson= L.geoJson(statesData, {
		style: stylelayer.defecto,
		onEachFeature: onEachFeature
	}).addTo(map);





	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
			// dblclick : selectFeature
		});
	}

	var popupLayer;
	function highlightFeature(e){

	

	var layer = e.target;
	

		layer.setStyle(stylelayer.highlight);

//var properties= e.target.feature.properties

           /*  popupLayer=   e.target.bindPopup(`
				Amout: ${properties.amount}<br>
				Municipality: ${properties.municipality}<br>
				Phone:${properties.phone}<br>
				Province:${properties.province}<br>
				ptype:${properties.ptype}<br>
				town:${properties.town}<br>
				zipcode:${properties.zipcode}

                	`)*/

           /* .on('mouseover', function(e) {
                    this.openPopup();
                })*/
               

		info.update(layer.feature.properties);
	}



	function resetHighlight(e){
		
	var layer=e.target;
		var feature=e.target.feature;

		if(checkExistsLayers(feature)){
			setStyleLayer(layer,stylelayer.highlight)

		}else{
			setStyleLayer(layer,stylelayer.defecto)
		}

		/* popupLayer.on('mouseout', function(e) {
                    this.closePopup();
                })*/
	}

	var featuresSelected=[]
	function zoomToFeature(e){

		var layer=e.target;
		var feature=e.target.feature;

		if(checkExistsLayers(feature)){
			removerlayers(feature,setStyleLayer,layer,stylelayer.defecto)
			removeBounds(layer)

		}else{
			addLayers(feature,setStyleLayer,layer,stylelayer.highlight)
			addBounds(layer)
		}
		map.fitBounds(arrayBounds);
		detailsselected.update(featuresSelected)
		
	}


	function selectTypeaheadFeature(layer){

		var layer=layer;
		var feature=layer.feature;

		if(checkExistsLayers(feature)){
			removerlayers(feature,setStyleLayer,layer,stylelayer.defecto)
			
			removeBounds(layer)

		}else{
			addLayers(feature,setStyleLayer,layer,stylelayer.highlight)
			addBounds(layer)
		}
		map.fitBounds(arrayBounds.length!=0 ? arrayBounds: initbounds)
		detailsselected.update(featuresSelected)
		
	}

	var corner1 = L.latLng(17, 81),
	corner2 = L.latLng(19, 83)
	var initbounds = L.latLngBounds(corner1,corner2)
	var arrayBounds = [];

	function addBounds(layer){
		arrayBounds.push(layer.getBounds())
	}
	function removeBounds(layer){
		arrayBounds = arrayBounds.filter(bounds => bounds!= layer.getBounds())
	}


	function setStyleLayer(layer,styleSelected){
		layer.setStyle(styleSelected)
	}

	function removerlayers(feature,callback){
		featuresSelected = featuresSelected.filter(obj => obj.vcode11!= feature.properties.vcode11)
		callback(arguments[2],arguments[3])
	}

	function addLayers(feature,callback){
   		featuresSelected.push({
			vcode11: feature.properties.vcode11,
			feature: feature
		})
		callback(arguments[2],arguments[3])
	}

	function checkExistsLayers(feature){
   		
   		var result=false
   		for (var i = 0; i < featuresSelected.length; i++) {
   			if(featuresSelected[i].vcode11==feature.properties.vcode11){
   				result=true;
   				break;
   			}

   		};
   		return result
   			}


	

	/**/

		var info = L.control({
			position:'bottomleft'
		});

		info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
		};

		info.update = function (properties) {
		this._div.innerHTML =

		'<h4>Properties</h4>' +  (properties ?
			`
				Object ID: ${properties.FID}<br>
				state : ${properties.stname}<br>
				area :${properties.Shape_Area}<br>
				place :${properties.bpname}<br>
				city :${properties.dtname}
                
                	`
			: 'Hover over a place on the map');
			 ;
		};

	info.addTo(map);


	var detailsselected = L.control();

	detailsselected.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info scroler');
		this.update();
		return this._div;
		};



	var detailshow=function (){
		var result=''
		var total=0
		for (var i = 0; i < featuresSelected.length; i++) {

			var properties=featuresSelected[i].feature.properties
			result+=
			`
			Object ID: ${properties.FID}<br>
            state : ${properties.stname}<br>
            area :${properties.Shape_Area}<br>
            place :${properties.bpname}<br>
            pincode :${properties.vcode11}
            
	
		<hr>`;
		total+=	properties.FID

			
		}
		return {result:result,total:total};
	}

	detailsselected.update = function (arrayselected) {

		var details=detailshow()

		this._div.innerHTML ='<b>TOTAL: '+ details.total+ '</b><br>'+  details.result;
		$('#suma', window.parent.document).val(details.total);
     
			
		};

		detailsselected.addTo(map);


		function dellayer(vcode11){
		geojson.eachLayer(function(layer) {
               if(layer.feature.properties.vcode11==vcode11){
               		selectTypeaheadFeature(layer)
               }
         })
		}
