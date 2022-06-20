let wien = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Wien",
};

let startLayer = L.tileLayer.provider('OpenStreetMap.Mapnik');

let map = L.map("map", {
    center: [wien.lat, wien.lng],
    zoom: 11,
    layers: [
        startLayer
    ],
})

let overlay = {
    badestellen: L.featureGroup(),
    waldspielplaetze: L.featureGroup(),
    spielplaetze: L.featureGroup(),
    grillzonen: L.featureGroup(),
    parkanlagen: L.featureGroup(),
    fussgaenger: L.featureGroup(),
};

let layerControl = L.control.layers({
    "OpenStreetMap": startLayer,
    "OpenTopoMap": L.tileLayer.provider('OpenTopoMap'),
    "BasemapAT hd": L.tileLayer.provider('BasemapAT.highdpi'),
    "Basemap mit Orthofoto und Beschriftung": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay"),
    ])
}, {
    "Badestellen": overlay.badestellen,
    "Waldspielplätze": overlay.waldspielplaetze,
    "Spielplätze": overlay.spielplaetze,
    "Grillzonen": overlay.grillzonen,
    "Parkanlagen": overlay.parkanlagen,
    "Fußgänger": overlay.fussgaenger
}).addTo(map)


// Einbau von 5 PLUGINS

//Massstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Fullscreen
L.control.fullscreen().addTo(map);

//Minimap
let miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("OpenStreetMap"), {
        "toggleDisplay": "True"
    }
).addTo(map);

//Reset view
L.control.resetView({
    position: "topleft",
    title: "Reset view",
    latlng: L.latLng([wien.lat, wien.lng]),
    zoom: wien.zoom,
}).addTo(map);

//Polyline measure
L.control.polylineMeasure().addTo(map);

// FUNKTIONEN AUFRUFEN und GeoJSON einspielen

//Fußgängerzonen OKEEE -------------------------------------------------------------
async function loadZones(url) { //anders
    let response = await fetch(url);
    let geojson = await response.json();
    console.log("Fußgänger", geojson); //nur ums in der Console zu sehen

    L.geoJSON(geojson, {
        style: function (feature) {
            return {
                color: "#F012BE",
                weight: 1,
                opacity: 0.9,
                //fillColor: "#F012BE",
                fillOpacity: 0.5,
            }
        }
    }).bindPopup(function (layer) {
        return `
        <h4>Fußgängerzone ${layer.feature.properties.ADRESSE}</h4>
        <p>Zeitraum: ${layer.feature.properties.ZEITRAUM || ""}</p>
        <p>${layer.feature.properties.AUSN_TEXT || ""}</p>
        `;
    }).addTo(overlay.fussgaenger);
}
loadZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");

// Badestellen Vienna OKEEE -------------------------------------------------------------
async function loadBaden(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson); //nur ums in der Console zu sehen
    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
                Name/Standort: <br><strong>${geoJsonPoint.properties.BEZEICHNUNG}</strong>
                <hr>
                Wassertemperatur: ${geoJsonPoint.properties.WASSERTEMPERATUR}<br>
                Wasserqualität: ${geoJsonPoint.properties.BADEQUALITAET}<br>
                <a href="${geoJsonPoint.properties.WEITERE_INFO}" target="_blank" >Weblink</a>
        `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `../icons/baden.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay.badestellen);
}
loadBaden("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BADESTELLENOGD&srsName=EPSG:4326&outputFormat=json");

//Parkanlagen Vienna  -------------------------------------------------------------
async function loadPark(url) { //anders
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log("Park", geojson); //nur ums in der Console zu sehen

    let cparkanlagen = L.markerClusterGroup({
        disableClusteringAtZoom: 17
    });
    //layerControl.addOverlay(overlay, "Hotels & Unterkünfte Vienna"); //ANDERS
    cparkanlagen.addTo(overlay.parkanlagen);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
                Name/Standort: <br><strong>${geoJsonPoint.properties.BEZEICHNUNG}</strong>
                <hr>
                Wassertemperatur: ${geoJsonPoint.properties.WASSERTEMPERATUR}<br>
                Wasserqualität: ${geoJsonPoint.properties.BADEQUALITAET}<br>
                <a href="${geoJsonPoint.properties.WEITERE_INFO}" target="_blank" >Weblink</a>
        `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `../icons/urbanpark.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(cparkanlagen);
}
loadPark("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json");


// Spielplätze -------------------------------------------------------------
async function loadSpiel(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson); //nur ums in der Console zu sehen
    
    let cspielplaetze = L.markerClusterGroup({
        disableClusteringAtZoom: 17
    });
    //layerControl.addOverlay(overlay, "Hotels & Unterkünfte Vienna"); //ANDERS
    cspielplaetze.addTo(overlay.spielplaetze);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            Name/Standort: <br><strong>${geoJsonPoint.properties.BEZEICHNUNG}</strong>
            <hr>
            Wassertemperatur: ${geoJsonPoint.properties.WASSERTEMPERATUR}<br>
            Wasserqualität: ${geoJsonPoint.properties.BADEQUALITAET}<br>
            <a href="${geoJsonPoint.properties.WEITERE_INFO}" target="_blank" >Weblink</a>
    `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `../icons/spielplatz.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(cspielplaetze);
}
loadSpiel("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SPIELPLATZPUNKTOGD&srsName=EPSG:4326&outputFormat=json");

// Waldspielplätze -------------------------------------------------------------
async function loadWaldspiel(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson); //nur ums in der Console zu sehen
    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            let popup = `
            Name/Standort: <br><strong>${geoJsonPoint.properties.BEZEICHNUNG}</strong>
            <hr>
            Wassertemperatur: ${geoJsonPoint.properties.WASSERTEMPERATUR}<br>
            Wasserqualität: ${geoJsonPoint.properties.BADEQUALITAET}<br>
            <a href="${geoJsonPoint.properties.WEITERE_INFO}" target="_blank" >Weblink</a>
    `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `../icons/wspielplatz.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay.waldspielplaetze);
}
loadWaldspiel("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:WALDSPIELPLOGD&srsName=EPSG:4326&outputFormat=json");


// Grillzonen OKEEE -------------------------------------------------------------
async function loadGrill(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log("Grillzonen: ", geojson); //nur ums in der Console zu sehen
    L.geoJSON(geojson, {
        style: function (feature) {
            return {
                color: "#FFDC00",
                weight: 1,
                opacity: 0.9,
                fillOpacity: 0.5,
            }
        }
    }).bindPopup(function (layer) {
        return `
        Lage: ${layer.feature.properties.LAGE},<br><hr>
        Reservierung: ${layer.feature.properties.RESERVIERUNG},<br>
        <a href="${layer.feature.properties.WEBLINK1}" target="_blank" >Weblink</a>
        `;
    }).addTo(overlay.grillzonen);
}
loadGrill("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:GRILLZONEOGD&srsName=EPSG:4326&outputFormat=json");

