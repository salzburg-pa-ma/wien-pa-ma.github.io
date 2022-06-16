/* OGD Wien Beispiel */

let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom",
};

let startLayer = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [stephansdom.lat, stephansdom.lng],
    zoom: 15,
    layers: [
        startLayer
    ],
})

let layerControl = L.control.layers({
    "BasemapAT Grau": startLayer,
    "BasemapAT Standard": L.tileLayer.provider('BasemapAT.basemap'),
    "BasemapAT High-DPI": L.tileLayer.provider('BasemapAT.highdpi'),
    "BasemapAT Gelände": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT Oberfläche": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT Orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT Beschriftung": L.tileLayer.provider('BasemapAT.overlay'),
    "Basemap Orthofoto mit Beschriftung": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}).addTo(map)

layerControl.expand();

/*
//Sehenswürdigkeiten in Layercontrol
let sightLayer = L.featureGroup();

layerControl.addOverlay(sightLayer, "Sehenswürdigkeiten");

let mrk = L.marker([stephansdom.lat, stephansdom.lng]).addTo(sightLayer);

sightLayer.addTo(map);
*/

//Massstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Fullscreen
L.control.fullscreen().addTo(map);

//Minimap
let miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT"), {
        "toggleDisplay": "True"
    }
).addTo(map);

// Asynchrone Funktion zum Laden der GeoJSON datei mit Sehenswürdigkeiten
// und Einfügen in Karte
async function loadSites(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);

    //Sehenswürdigkeiten in Layercontrol
    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Sehenswürdigkeiten");
    overlay.addTo(map);
    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map);
            //console.log(geoJsonPoint.properties.NAME)
            let popup = `
            <img src="${geoJsonPoint.properties.THUMBNAIL}" alt=""><br>
            <strong> ${geoJsonPoint.properties.NAME} </strong>
            <hr>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            <a href="${geoJsonPoint.properties.WEITERE_INF}">Weblink</a>
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png", //aus: https://mapicons.mapsmarker.com/markers/media/photo/?custom_color=ffffff
                    iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                    popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay); // https://leafletjs.com/reference.html#geojson
}
loadSites("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")

//Haltestellen Vienna Sightseeing
async function loadStops(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);

    //Sightseeing in Layercontrol
    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Sightseeing Stops");
    overlay.addTo(map);
    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map);
            //console.log(geoJsonPoint.properties)
            let popup = `
            <strong>${geoJsonPoint.properties.LINE_NAME}</strong><br>
            Station ${geoJsonPoint.properties.STAT_NAME}
            `;

            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/bus_${geoJsonPoint.properties.LINE_ID}.png`,
                    iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                    popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}
loadStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json")

//Linien Vienna Sightseeing
async function loadLines(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);

    //Sightseeing in Layercontrol
    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Sightseeing Liniennetz");
    overlay.addTo(map);
    L.geoJSON(geojson).addTo(overlay); // https://leafletjs.com/reference.html#geojson

    L.geoJSON(geojson, {
        style: function (feature) {
            //console.log(feature)

            let colors = {
                "Red Line": " #FF4136 ",
                "Yellow Line": "#FFDC00",
                "Blue Line": "#0074D9",
                "Green Line": " #2ECC40 ",
                "Grey Line": "#AAAAAA",
                "Orange Line": "#FF851B"
            };
            return {
                color: `${colors[feature.properties.LINE_NAME]}`,
                weight: 4,
                dashArray: [10, 6]
            }
        }
    }).bindPopup(function (layer) {
        return `
        <h4>${layer.feature.properties.LINE_NAME}</h4>
        von: ${layer.feature.properties.FROM_NAME}
        <br>
        nach: ${layer.feature.properties.TO_NAME}
        `
    }).addTo(overlay);
}
loadLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json")

//Fußgängerzonen
async function loadZones(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);

    //Fußgängerzonen in Layercontrol
    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Fußgängerzonen");
    overlay.addTo(map);
    L.geoJSON(geojson, {
        style: function (feature) {
            return {
                color: "#F012BE",
                weight: 1,
                opacity: 0.1,
                fillOpacity: 0.1
            }
        }
    }).bindPopup(function (layer) {
        return `
            <h4>Fußgängerzone ${layer.feature.properties.ADRESSE}</h4>
            <p>${layer.feature.properties.ZEITRAUM || ""}</p>
            <p>${layer.feature.properties.AUSN_TEXT || ""}</p>
        `;
    }).addTo(overlay);
    // https://leafletjs.com/reference.html#geojson
}
loadZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json")

//Hotels und Unterkünfte
async function loadHotels(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);
    console.log(geojson.features);

    // Hotels nach Name sortieren
    geojson.features.sort(function (a, b) {
        return a.properties.BETRIEB.toLowerCase() > b.properties.BETRIEB.toLowerCase()
    })

    let overlay = L.markerClusterGroup({
        disableClusteringAtZoom: 17
    });

    layerControl.addOverlay(overlay, "Hotels und Unterkünfte");

    overlay.addTo(map);
    let hotelsLayer = L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map);
            //console.log(geoJsonPoint.properties)
            let searchList = document.querySelector("#searchList");
            searchList.innerHTML += `<option value="${geoJsonPoint.properties.BETRIEB}"></option>`;

            //console.log(document.querySelector("#searchList").innerHTML)
            //console.log(`<option value="${geoJsonPoint.properties.BETRIEB}"></option>`);

            let popup = `
            ${geoJsonPoint.properties.KATEGORIE_TXT} ${geoJsonPoint.properties.BETRIEBSART_TXT} <br>
            <strong>${geoJsonPoint.properties.BETRIEB}</strong><br>
            <hr>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            Telefonnummer: ${geoJsonPoint.properties.KONTAKT_TEL}<br>
            E-Mail: <a href="mailto:${geoJsonPoint.properties.KONTAKT_EMAIL}">${geoJsonPoint.properties.KONTAKT_EMAIL}</a><br>
            <a href="${geoJsonPoint.properties.WEBLINK1}">Website</a><br>
            `;
            let iconHotel
            if (`${geoJsonPoint.properties.BETRIEBSART}` == "H") {
                iconHotel = "icons/hotel_H.png"
            } else if (`${geoJsonPoint.properties.BETRIEBSART}` == "P") {
                iconHotel = "icons/hotel_P.png"
            } else {
                iconHotel = "icons/hotel_A.png"
            }

            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: iconHotel,
                    iconAnchor: [16, 37], //Verschieben des Icons dass Spitze richtig ist
                    popupAnchor: [0, -37] //Verschieben des Popups, dass es nicht das Icon verdeckt
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);

    let form = document.querySelector("#searchForm");
    form.suchen.onclick = function () {

        //console.log(form.hotel.value);
        hotelsLayer.eachLayer(function (marker) {
            /*console.log(marker)
            console.log(marker.getLatLng())
            console.log(marker.getPopup())
            console.log(marker.feature.properties.BETRIEB)*/
            if (form.hotel.value == marker.feature.properties.BETRIEB) {
                map.setView(marker.getLatLng(), 17);
                marker.openPopup();
            }
        })
    }

}
loadHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")