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


let overlays = {
    badestellen: L.featureGroup(),
    waldspielplaetze: L.featureGroup(),
    spielplaetze: L.featureGroup(),
    grillzonen: L.featureGroup(),
    wanderwege: L.featureGroup(),
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
    "Badestellen": overlays.badestellen,
    "Waldspielplätze": overlays.waldspielplaetze,
    "Spielplätze": overlays.spielplaetze,
    "Grillzonen": overlays.grillzonen,
    "Wanderwege": overlays.wanderwege,
}).addTo(map)

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

// FUNKTIONEN AUFRUFEN

async function loadBaden(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log(geojson);
    let overlay = L.featureGroup();
    layerControl.addOverlay(overlay, layername);
    overlay.addTo(map);


}
loadBaden("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BADESTELLENOGD&srsName=EPSG:4326&outputFormat=json")



