let wien = {
    lat: 48.208333,
    lng: 16.373056,
    title: "Wien",
    zoom: 11,
};

let startLayer = L.tileLayer.provider('OpenStreetMap.Mapnik');

let map = L.map("map", {
    center: [wien.lat, wien.lng],
    zoom: wien.zoom,
    layers: [
        startLayer
    ],
})


let overlays = {
    schwimmen: L.featureGroup(),
    silvester: L.featureGroup(),
    sport: L.featureGroup(),
};

let layerControl = L.control.layers({
    "OpenStreetMap": startLayer,
    "OpenTopoMap": L.tileLayer.provider('OpenTopoMap'),
    "BasemapAT hd": L.tileLayer.provider('BasemapAT.highdpi'),
}, {
    "Schwimmbäder": overlays.schwimmen,
    "Silvesterpfad": overlays.silvester,
    "Sportstätten indoor": overlays.sport,
}).addTo(map)
layerControl.expand()


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
                return L.marker(latlng, {
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
    //console.log(geojson);

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
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `../icons/silvester_${typ}.png`,
                    iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                    popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                })
            }).bindPopup(popup);
        }
    }).addTo(overlays.silvester);

    // features sortieren, dass alle Stationen mit Nummer vorne sind
    geojson.features.sort(function (a, b) {
        return a.properties.BEZEICHNUNG.split("-")[0] > b.properties.BEZEICHNUNG.split("-")[0];
    });
    // features nach Nummer sortieren
    geojson.features.sort(function (a, b) {
        return parseInt(a.properties.BEZEICHNUNG.split("-")[0]) > parseInt(b.properties.BEZEICHNUNG.split("-")[0]);
    });
    //console.log(geojson)
    //console.log(parseInt("9") > parseInt("10"))
    //function which creates arrays with lat and lon of the points

    function ArrayFromPoints(geojson) {
        let stations = []
        for (i = 0; i < geojson.totalFeatures; i += 1) {
            if (geojson.features[i].properties.TYP == 1) {
                stations.push([geojson.features[i].geometry.coordinates[1], geojson.features[i].geometry.coordinates[0]])

            }
        }
        return stations
    }
    let polyline = L.polyline(ArrayFromPoints(geojson), {
        color: '#ad59c2'
    }).addTo(overlays.silvester);

}
loadSilvester("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SILVESPFADPKTOGD&srsName=EPSG:4326&outputFormat=json")

async function loadSport(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //nur Schwimmbäder anzeigen, die offen sind und Platz haben
            let kategorie = geoJsonPoint.properties.KATEGORIE_NUM;
            let art = geoJsonPoint.properties.SPORTSTAETTEN_ART;
            let popup = `<strong>${geoJsonPoint.properties.SPORTSTAETTEN_ART}</strong><br>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            <a href="${geoJsonPoint.properties.WEBLINK1}">Weblink</a>
            `;
            //console.log(art.includes('Tennis'));
            if (kategorie == 2 & art.includes('Tennis') || kategorie == 2 & art.includes('Badminton')) {
                //console.log(geoJsonPoint.properties)
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "../icons/tennis.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            };
            function IconKategorie(bezeichung, icon){
                
            }

            if (kategorie == 2 & art.includes('Kletter')) {
                //console.log(geoJsonPoint.properties)
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "../icons/climbing.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            };

            if (kategorie == 2 & art.includes('Bowling')) {
                //console.log(geoJsonPoint.properties)
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "../icons/bowling.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            };

            if (kategorie == 2 & art.includes('Handball')) {
                //console.log(geoJsonPoint.properties)
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "../icons/handball.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            };
            if (kategorie == 2 & art.includes('Eis')) {
                //console.log(geoJsonPoint.properties)
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "../icons/icehockey.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            };
            if (kategorie == 2 & art.includes('Fußball')) {
                //console.log(geoJsonPoint.properties)
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "../icons/soccer.png",
                        iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                        popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                    })
                }).bindPopup(popup);
            };
        }
    }).addTo(overlays.sport);
}
loadSport("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SPORTSTAETTENOGD&srsName=EPSG:4326&outputFormat=json")