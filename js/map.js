//Initialisation des fonctions Asynchrones Fetch
initMap();

async function initMap(){

//Initialisation de la map
var map = L.map('map').setView([50.83,4.4], 12);

//Configuration de la projection geographique
proj4.defs('EPSG:31370', '+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs');

var hash = new L.Hash(map);

L.control.locate({locateOptions: {maxZoom: 19}}).addTo(map);
//Configuration de l'outil de mesure
var measureControl = new L.Control.Measure({
            position: 'topleft',
            primaryLengthUnit: 'meters',
            secondaryLengthUnit: 'kilometers',
            primaryAreaUnit: 'sqmeters',
            secondaryAreaUnit: 'hectares'
        });
measureControl.addTo(map);

//Modification de la Class (css) de l'outil de mesure
document.getElementsByClassName('leaflet-control-measure-toggle')[0]
        .innerHTML = '';
        document.getElementsByClassName('leaflet-control-measure-toggle')[0]
        .className += ' fa fa-ruler';

//Layers

//Urbis gray (wms)
var urbisFr = L.tileLayer.wms('http://geoservices-urbis.irisnet.be/geoserver/ows', {
	layers: 'Urbis:urbisFR',
  format: 'image/png',
  uppercase: true,
  transparent: true,
  continuousWorld : true,
  opacity: 1,
  identify: false,
  }).addTo(map);

// Urbis ortho (wms)
var ortho2019 = L.tileLayer.wms('http://geoservices-urbis.irisnet.be/geoserver/ows', {
	layers: 'Urbis:Ortho2019',
  format: 'image/png',
  uppercase: true,
  transparent: true,
  continuousWorld : true,
  opacity: 1,
  identify: false,
	});

  

// Urbis ortho (wms)
var pr = L.tileLayer.wms('https://data.parking.brussels/geoserver/ParkingBrussels/wms?', {
	layers: 'ParkingBrussels:park_and_ride',
  format: 'image/png',
  uppercase: true,
  transparent: true,
  continuousWorld : true,
  opacity: 1,
  identify: false,
  });
  


//Contour communes (geojson issus du geoserver parking.brussels via fonction async fetch)
let resCommune = await fetch('https://data.parking.brussels/geoserver/ParkingBrussels/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ParkingBrussels:municipality&maxFeatures=50&outputFormat=application%2Fjson');
let communeJson = await resCommune.json();

var commune = L.Proj.geoJson(communeJson, {
  onEachFeature: pop_test_0,
}).addTo(map);






//Parkings publics (geojson issus du geoserver parking.brussels via fonction async fetch)
let response = await fetch('https://data.parking.brussels/geoserver/ParkingBrussels/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ParkingBrussels:public_parking&maxFeatures=50&outputFormat=application%2Fjson');
let geojsonFeatureCollection = await response.json();

var geojson = L.Proj.geoJson(geojsonFeatureCollection, {
  onEachFeature: pop_test_0,
});

var clusterGeojson = new L.MarkerClusterGroup({
  showCoverageOnHover: true,
  spiderfyDistanceMultiplier: 2,
});

clusterGeojson.addLayer(geojson);

var bounds_group = new L.featureGroup([]);
bounds_group.addLayer(geojson);
clusterGeojson.addTo(map);



function pop_test_0(feature, layer) {
  var popupContent = '<table>\
          <tr>\
              <td colspan="2">' + (feature.properties['id'] !== null ? Autolinker.link(feature.properties['id'].toLocaleString(), {truncate: {length: 30, location: 'smart'}}) : '') + '</td>\
          </tr>\
      </table>';
  layer.bindPopup(popupContent, {maxHeight: 400});
}

//Ajout d'une echelle graphique
L.control.scale({position: "bottomright"}).addTo(map);

//Ajout du logo (a améliorer)
var info=L.control( {
  position: "bottomleft"
}

);
info.onAdd=function(e) {
  return this._div=L.DomUtil.create("div"),
  this.update(),
  this._div
},
info.update=function(e) {
  this._div.innerHTML='<img height="80px" src="./css/images/logo.png" />'
},
info.addTo(map);

//Ajout de la fonction recherche de rue
var osmGeocoder = new L.Control.Geocoder({
    collapsed: true,
    position: 'topleft',
    text: 'Search',
    title: 'Testing'
}).addTo(map);
document.getElementsByClassName('leaflet-control-geocoder-icon')[0]
.className += ' fa fa-search';
document.getElementsByClassName('leaflet-control-geocoder-icon')[0]
.title += 'Search for a place';

//Configuration de la légende
var baseMaps = {"Ortho2019": ortho2019,"urbisFr": urbisFr,};
var overLayers = {'<img src="legend/test_1.png" /> test': clusterGeojson,'Commune':commune,'P+R':pr};
L.control.layers(baseMaps,overLayers).addTo(map);
setBounds();




}