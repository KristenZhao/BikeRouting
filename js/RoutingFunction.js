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
  this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
}

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

// variables for creating a WKT
var wkt_conversion = function(route){
  // var route_wktstring = [];
  var start = "LINESTRING(";
  var end = ")";
  var join = ", ";
  route_decoded = decode(route.overview_polyline);
  middle = _.map(route_decoded,function(d) {
    return (d.longitude + " " + d.latitude);
  }).join(join);
    wkt = start + middle + end; // well known text line string
  // route_wktstring.push(wkt);
  return wkt;
};

//// a function to get sql query string
var get_url = function(wkt){
  var sql = 'select * from allscore_length as L where ST_DWithin(ST_GeomFromText(\'' +
  wkt + '\')::geography,st_centroid(L.the_geom)::geography,5)';
  var url = "https://KristenZhao.carto.com/api/v2/sql?format=GeoJSON&q="+sql;
  return url;
};
//// carto SQL query desired rows
var getRouteScore = function(urls){
  $(urls).each(function(url){
    var scoreArray = [];
    // Start query and score calculation
    $.getJSON(url).done(function(data){
      var sumlength = _.reduce(data.features, function(memo,i) {
        return memo+i.properties.lengthft;
      }, 0);
      _.each(data.features, function(iteratee){
        iteratee.properties.weightedScore =
        Math.round(iteratee.properties.lengthft/sumlength*iteratee.properties.finalscore);
      });
      var avgscore = _.reduce(data.features, function(memo,i){
        return memo+i.properties.weightedScore;
      }, 0);
      console.log('avgscore',avgscore);
      scoreArray.push(avgscore);
    });
  });
};



AutocompleteDirectionsHandler.prototype.route = function() {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;
  var route_analyze = function(response, status) {
    if (status === 'OK') {
      me.directionsDisplay.setDirections(response);
      var route_wktstring = _.map(me.directionsDisplay.directions.routes,wkt_conversion);
      var urls = _.map(route_wktstring,get_url);
      getRouteScore(urls);
      console.log('scoreArray',scoreArray);
     }
     else {
     window.alert('Directions request failed due to ' + status);
     }
   };

  this.directionsService.route({
    origin: {'placeId': this.originPlaceId},
    destination: {'placeId': this.destinationPlaceId},
    travelMode: this.travelMode,
    provideRouteAlternatives: true
  }, route_analyze);

     //Setting direction display
    //  setTimeout(function(){
    //    for(i=0; i< me.directionsDisplay.directions.routes.length;i++){
    //      var num = i+1;
    //      var options = '#option'.concat(num.toString());
    //     //  console.log('num:',num);
    //     //  console.log('option'.concat(num.toString()));
    //      $(options).show();
    //      $(options.concat(' h6')).text(
    //        ('via '.concat(me.directionsDisplay.directions.routes[i].summary))
    //      );
    //      $(options.concat(' > div.mdl-grid > div:nth-child(2)')).text(
    //        me.directionsDisplay.directions.routes[i].legs[0].distance.text
    //      );
    //      $(options.concat(' > div.mdl-grid > div:nth-child(3)')).text(
    //        me.directionsDisplay.directions.routes[i].legs[0].duration.text
    //      );
    //      $(options.concat(' > div:nth-child(3) > div > h4')).text(
    //        scoreArray[i].toString()
    //      );
    //     // asynchro
    //    }
    //  },4000);
     // set event listener
    //  $('.controls').on('click',function(e){
    //    for(i=0; i< me.directionsDisplay.directions.routes.length;i++){
    //      var num = i+1;
    //      var options2 = '#option'.concat(num.toString());
    //      //console.log(options2);
    //      $(options2).hide();
    //    }
    //  });


    // } //// Error handling:
};
