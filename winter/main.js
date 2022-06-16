let wien = {
    lat: 48.208333,
    lng: 16.373056,
    title: "Wien",
};

let startLayer = L.tileLayer.provider('OpenStreetMap.Mapnik');

let winterLayer = L.tileLayer("https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
    attribution: '&copy; <a href="https://lawinen.report">CC BY avalanche.report</a>'
})

let map = L.map("map", {
    center: [wien.lat, wien.lng],
    zoom: 11,
    layers: [
        startLayer
    ],
})


let overlays = {
    schwimmen: L.featureGroup(),
    maerkte: L.featureGroup(),
};

let layerControl = L.control.layers({
    "OpenStreetMap": startLayer,
    "Winter": winterLayer,
    "OpenTopoMap": L.tileLayer.provider('OpenTopoMap'),
    "BasemapAT hd": L.tileLayer.provider('BasemapAT.highdpi'),
}, {
    "Schwimmbäder": overlays.schwimmen,
    "Weihnachtsmärkte": overlays.maerkte
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

async function loadSchwimmen(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log(geojson.features[0]);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //nur Schwimmbäder anzeigen, die offen sind und Platz haben
            let offen = geoJsonPoint.properties.AUSLASTUNG_AMPEL_KATEGORIE_0;
            if (offen == 1) {
                //console.log(geoJsonPoint.properties)
                let popup = `
            <strong> ${geoJsonPoint.properties.NAME} </strong>
            <hr>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            <a href="${geoJsonPoint.properties.WEBLINK1}">Weblink</a>
            `;
                return L.marker(latlng,{
                    icon: L.icon({
                        iconUrl: "../icons/swimming2.png", //aus: https://mapicons.mapsmarker.com/markers/media/photo/?custom_color=ffffff
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            }
        }
    }).addTo(overlays.schwimmen);
}
loadSchwimmen("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SCHWIMMBADOGD&srsName=EPSG:4326&outputFormat=json")