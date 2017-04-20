// Load the google map
//<script>

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.996926, lng: -75.21183},
    zoom: 11
  });
  new AutocompleteDirectionsHandler(map);
}

// hide route option panels
$( "#option1" ).hide();
$( "#option2" ).hide();
$( "#option3" ).hide();

//</script>
function AutocompleteDirectionsHandler(map) {
      this.map = map;
      this.originPlaceId = null;
      this.destinationPlaceId = null;
      this.travelMode = 'BICYCLING';
      var originInput = document.getElementById('origin-input');
      var destinationInput = document.getElementById('destination-input');
      var modeSelector = document.getElementById('mode-selector');
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer();
      this.directionsDisplay.setMap(map);

      var originAutocomplete = new google.maps.places.Autocomplete(
          originInput, {placeIdOnly: true});
      var destinationAutocomplete = new google.maps.places.Autocomplete(
          destinationInput, {placeIdOnly: true});
      //
      // this.setupClickListener('changemode-biking', 'BICYCLING');
      // this.setupClickListener('changemode-transit', 'TRANSIT');
      // this.setupClickListener('changemode-driving', 'DRIVING');

      this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
      this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

      // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
      // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
      //this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
// AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
//   var radioButton = document.getElementById(id);
//   var me = this;
//   radioButton.addEventListener('click', function() {
//     me.travelMode = mode;
//     me.route();
//   });
// };

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', this.map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      window.alert("Please select an option from the dropdown list.");
      return;
    }
    if (mode === 'ORIG') {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });

};

AutocompleteDirectionsHandler.prototype.route = function() {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;

  this.directionsService.route({
    origin: {'placeId': this.originPlaceId},
    destination: {'placeId': this.destinationPlaceId},
    travelMode: this.travelMode,
    provideRouteAlternatives: true
  }, function(response, status) {
    if (status === 'OK') {
      me.directionsDisplay.setDirections(response);
      console.log('display:',me.directionsDisplay);
      //// Convert polyline into points and put into one array
      console.log(me.directionsDisplay.directions.routes.length);
      var route_wktstring = [];
      var start = "LINESTRING(";
      var end = ")";
      var join = ", ";
      // create a function to convert route codes into well-known texts
      var wkt_conversion = function(route){
        route_decoded = decode(route.overview_polyline);
        middle = _.map(route_decoded,function(d){
          return (d.longitude + " " + d.latitude);}).join(join);
          wkt = start + middle + end; // well known text line string
        route_wktstring.push(wkt);
      };
      _.each(me.directionsDisplay.directions.routes,wkt_conversion);
      console.log('route_wktstring.length',route_wktstring.length);
      //// carto SQL query desired rows
      var scoreArray = [];
      var getRouteScore = function(wktstring){
        var cartoUserName = 'KristenZhao';
        var sql = 'select * from laneconnslopectrlcrash_score_2 as L where ST_DWithin(ST_GeomFromText(\'' +
        wktstring + '\')::geography,st_centroid(L.the_geom)::geography,5)';
        var format = "GeoJSON";
        var url = "https://"+cartoUserName+".carto.com/api/v2/sql?format="+format+"&q="+sql;
        // Start query and score calculation
        $.ajax(url).done(function(data){
          //console.log('data:',data);
          //console.log('finalscore1:',data.features[0].properties.finalscore);
          var sumscore = _.reduce(data.features, function(memo,i){
            return memo+i.properties.finalscore;}, 0);
          //console.log('sumscore',sumscore);
          //console.log('data length',data.features.length);
          var avgscore = Math.round(sumscore/data.features.length);
          //console.log('avgscore',avgscore);
          scoreArray.push(avgscore);
        });
      };
     _.each(route_wktstring,getRouteScore);
     console.log('scoreArray',scoreArray);

     //Setting direction display
     for(i=0; i< me.directionsDisplay.directions.routes.length;i++){
       
     }

    } //// Error handling:
      else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};
