let salzburg = {
    lat: 47.8,
    lng: 13.033333,
    title: "Salzburg",
};

let startLayer = L.tileLayer.provider('OpenStreetMap.Mapnik');

let winterLayer = L.tileLayer("https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
    attribution: '&copy; <a href="https://lawinen.report">CC BY avalanche.report</a>'
})

let map = L.map("map", {
    center: [salzburg.lat, salzburg.lng],
    zoom: 11,
    layers: [
        startLayer
    ],
})


let overlays = {
    skipisten : L.featureGroup(),
    wildruhezonen : L.featureGroup(),
};

let layerControl = L.control.layers({
    "OpenStreetMap": startLayer,
    "Winter": winterLayer,
    "OpenTopoMap": L.tileLayer.provider('OpenTopoMap'),
    "BasemapAT hd": L.tileLayer.provider('BasemapAT.highdpi'),
}, {
    "Skipisten": overlays.skipisten,
    "Wildruhezonen": overlays.wildruhezonen
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

async function loadWild(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log(geojson);

}
//loadWild("https://www.salzburg.gv.at/ogd/ebc45a6a-3e4f-41d3-bbf1-9c9f59618afc/Wildruhezonen.json")
