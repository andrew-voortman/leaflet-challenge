// all earthquakes for the past 7 days
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

function chooseColor(depth){
  if (depth < 10) return '#00FF00'
  else if (depth < 30 ) return "greenyellow";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "orangered";
  else return "red";
};

// Perform a GET request to the query URL/
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
    console.log('data', data)
});

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Depth: ${(feature.geometry.coordinates[2])}</p><p>Magnitude: ${(feature.properties.mag)}</p>`);
    }
  
    // Using leafletsjs documentation to create circlemarkers for each GeoJSON point feature and its latlng.
    function createCircleMarkers(feature, latlng){
      let markers = {
        radius: feature.properties.mag*5,
        weight: .5,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.75,
        color: 'black'
      }
      return L.circleMarker(latlng, markers);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: createCircleMarkers
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);

    
} 

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 15
    })

    // Don't need more than one base layer so consider removing
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      maxZoom: 15
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
      let depth = [0, 10, 30, 50, 70, 90]

      div.innerHTML = '<h1 style="text-align: center">Earthquake Depth</h1>';

      for (var i = 0; i < depth.length; i++) {
      div.innerHTML += '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      
      };
      // div.innerHTML += 
    return div
      // Adding the legend to the map
    };
  legend.addTo(myMap);

};
