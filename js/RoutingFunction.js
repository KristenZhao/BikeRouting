// Load the google map
//<script>
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.000, lng: -75.1639},
    zoom: 11
  });
  new AutocompleteDirectionsHandler(map);
}
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
            // Convert polyline into points and put into one array
            console.log(me.directionsDisplay.directions.routes.length);
            var route_points = [];
            _.each(me.directionsDisplay.directions.routes,function(route){
              route_points.push(decode(route.overview_polyline));
            });
            console.log(route_points);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      };

      //console.log('display2:',me.directionsDisplay);
      // decode()
