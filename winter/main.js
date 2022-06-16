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
    silvester: L.featureGroup(),
};

let layerControl = L.control.layers({
    "OpenStreetMap": startLayer,
    "Winter": winterLayer,
    "OpenTopoMap": L.tileLayer.provider('OpenTopoMap'),
    "BasemapAT hd": L.tileLayer.provider('BasemapAT.highdpi'),
}, {
    "Schwimmbäder": overlays.schwimmen,
    "Silvesterpfad": overlays.silvester,
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
    //console.log(geojson.features[0]);

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
                        iconUrl: "../icons/swimming2.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            }
        }
    }).addTo(overlays.schwimmen);
}
loadSchwimmen("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SCHWIMMBADOGD&srsName=EPSG:4326&outputFormat=json")

async function loadSilvester(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log(geojson);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //console.log(geoJsonPoint.properties)
            let popup = `
            <strong> ${geoJsonPoint.properties.BEZEICHNUNG} </strong>
            <hr>
            ${geoJsonPoint.properties.BESCHREIBUNG}
            <a href="${geoJsonPoint.properties.WEBLINK1}">Weblink</a>
            `;
            let typ = geoJsonPoint.properties.TYP
                return L.marker(latlng,{
                    icon: L.icon({
                        iconUrl: `../icons/silvester_${typ}.png`,
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            }
        }
    ).addTo(overlays.silvester);

    
    function connectDots(geojson) {
        let features = geojson.features,
            feature,
            c = [],
            i;
    
        for (i = 0; i < features.length; i += 1) {
            feature = features[i];
                c.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]);
        }
        return c;
    }

    for (i = 0; i< geojson.totalFeatures; i += 1){
        if (geojson.features[i].properties.TYP = 1){
    c = connectDots(geojson)
    console.log(c[1])
    let polyline = L.polyline(connectDots(geojson)).addTo(overlays.silvester);
        }
    }
 
}
loadSilvester("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SILVESPFADPKTOGD&srsName=EPSG:4326&outputFormat=json")
