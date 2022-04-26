var watchID, geoLoc, target, travelMode, directionsService, directionRenderer;
var flag = true;
var centered = false;
var completeButtonFlag = false;
var isopen = false;

var gMarkers = [];
var markers = {};
var NavPointers = [];
var target = {
    latitude: 1.379155,
    longitude: 103.849828
};
var trail = localStorage.getItem('Trail');
var bullets = document.querySelectorAll('#ProgressBar');
var disvalue = 0;
var stopRouteLineMarkersRepeat = 0;
//let pointsArray = [];

class checkElement {
    constructor(title, element) {
        this.title = title;
        this.element = element;
    }
}

// All of Chinatown's landmarks
const nyplol = trails.nyp.landmarks;
const Chinatownlol = trails.chinatown.landmarks;
const homelol = trails.home.landmarks;

const placenames = [];
const textdistance = [];

if (trail == 'nyp') {
    for (let i = 0; i < nyplol.length; i++) { 
        //change to nyplol back in school
        console.log(nyplol[i].legend);
        textdistance.push(new checkElement(nyplol[i].legend, document.createElement('a-entity')));
        placenames.push(new checkElement(nyplol[i].legend, document.createElement('a-entity')));
        console.log(textdistance[i].title);
        console.log(textdistance[i].element);
    }
}
else if (trail == 'Chinatown') {
    for (let i = 0; i < Chinatownlol.length; i++) { 
        //change to nyplol back in school
        console.log(Chinatownlol[i].legend);
        textdistance.push(new checkElement(Chinatownlol[i].legend, document.createElement('a-entity')));
        placenames.push(new checkElement(Chinatownlol[i].legend, document.createElement('a-entity')));
        console.log(textdistance[i].title);
        console.log(textdistance[i].element);
    }
}
else if (trail == 'home') {
    for (let i = 0; i < homelol.length; i++) { 
        //change to nyplol back in school
        console.log(homelol[i].legend);
        textdistance.push(new checkElement(homelol[i].legend, document.createElement('a-entity')));
        placenames.push(new checkElement(homelol[i].legend, document.createElement('a-entity')));
        console.log(textdistance[i].title);
        console.log(textdistance[i].element);
    }
}

if (trail == 'nyp') {
    if (localStorage.getItem('nyp Progress')) { // Progress exists
        var NYPPROGRESS = localStorage.getItem('nyp Progress');
        NYPPROGRESS = JSON.parse(NYPPROGRESS);
        for (let i = 0; i < NYPPROGRESS.length; i++) {
            if (NYPPROGRESS[i] == 1) {
                bullets[i].getElementsByClassName('bullets')[0].classList.add('completed');
            }
        }
        console.log('setting up progress for nyp');
    } else {
        var NYPPROGRESS = [0, 0, 0, 0, 0, 0, 0, 0]
        var progress = JSON.stringify(NYPPROGRESS)
        console.log("PROGRESSS", progress);
        localStorage.setItem('nyp Progress', progress);
        console.log('setting up progress for nyp');
    }
} else if (trail == 'Chinatown') {
    if (localStorage.getItem('Chinatown Progress')) {
        var CTPROGRESS = localStorage.getItem('Chinatown Progress');
        CTPROGRESS = JSON.parse(CTPROGRESS);
        for (let i = 0; i < CTPROGRESS.length; i++) {
            if (CTPROGRESS[i] == 1) {
                bullets[i].getElementsByClassName('bullets')[0].classList.add('completed');
            }
        }
    } else {
        var CTPROGRESS = [0, 0, 0, 0, 0, 0, 0, 0]
        var progress = JSON.stringify(CTPROGRESS)
        console.log("PROGRESSS", progress);
        localStorage.setItem('Chinatown Progress', progress);
    }
} else if (trail == 'home') {
    if (localStorage.getItem('home Progress')) {
        var HomePROGRESS = localStorage.getItem('home Progress');
        HomePROGRESS = JSON.parse(HomePROGRESS);
        for (let i = 0; i < HomePROGRESS.length; i++) {
            if (HomePROGRESS[i] == 1) {
                bullets[i].getElementsByClassName('bullets')[0].classList.add('completed');
            }
        }
    } else {
        var HomePROGRESS = [0, 0, 0, 0, 0, 0, 0, 0]
        var progress = JSON.stringify(HomePROGRESS)
        console.log("PROGRESSS", progress);
        localStorage.setItem('home Progress', progress);
    }
}

if (localStorage.getItem('landmarkIndex')) {
    var landmarkIndex = parseInt(localStorage.getItem('landmarkIndex'));

} else {
    var landmarkIndex = 0
}

// All of Chinatown's landmarks
const nyp = trails.nyp.landmarks;
const Chinatown = trails.chinatown.landmarks;
const home = trails.home.landmarks;

function getLocationUpdate() {
    
    directionsService = new google.maps.DirectionsService();
    directionRenderer = new google.maps.DirectionsRenderer({
        preserveViewport: true
    });

    if (navigator.geolocation) {
        geoLoc = navigator.geolocation
        // Get current positon 
        var options = {
            enableHighAccuracy: true,
            maximumAge: 0
        };
        geoLoc.getCurrentPosition(currentPositionSuccess, currentPositionError, options)

        // timeout  in 60 seconds
        var options = {
            timeout: 60000
        };

        // Watch position 
        watchID = geoLoc.watchPosition(success, errorHandler, options)
    } else {
        alert("Browser does not support geolocation!")
    }
}

function makeMarker(position, icon, title) {
    marker = new google.maps.Marker({
        position: position,
        label: {
            color: 'black',
            fontWeight: 'bold',
            text: title
        },
        map: map,
        icon: icon,
        title: title
    });
    return marker
}

function makeIncrementalMarker(position, i, title, content) {
    i++
    const infowindow = new google.maps.InfoWindow({
        content: content,
    });
    marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + i + '|33cc33|000000',
        title: title
    });
    console.log("LOOK", 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + i + '|33cc33|000000');
    marker.addListener("click", () => {
        infowindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
        });
    });
    return marker
}

function makeStartMarker(position, direction) {

    var heading = google.maps.geometry.spherical.computeHeading(direction, position);
    var line = new google.maps.Polyline({
        clickable: false,
        map: map,
        strokeOpacity: 0,
        path: [position, direction],
        icons: [{
            offset: '0%',
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 4,
                strokeOpacity: 1
            }
        }]
    })
    return line
}


function makeEndMarker(position, title) {
    console.log(title);
    marker = new google.maps.Marker({
        position: position,
        label: {
            color: 'black',
            fontWeight: 'bold',
            text: title
        },
        map: map,
        title: title
    });
    return marker
}

function removeMarkers() {
    for (i = 0; i < gMarkers.length; i++) {
        gMarkers[i].setMap(null);
    }
}

function smoothZoom(map, max, cnt) {
    if (cnt >= max) {
        return;
    } else {
        z = google.maps.event.addListener(map, 'zoom_changed', function (event) {
            google.maps.event.removeListener(z);
            smoothZoom(map, max, cnt + 1);
        });
        setTimeout(function () {
            map.setZoom(cnt)
        }, 80); // 80ms is what I found to work well on my system -- it might not work well on all systems
    }
}

function makeLandmarkMarkers(trail) {
    removeMarkers()
    // See overview of all landmarks
    for (let i = 0; i < trail.length; i++) {
        landmark = trail[i]
        marker = makeIncrementalMarker(landmark.location, i, landmark.name, landmark.contentHTML) //position, i
        gMarkers.push(marker);
    }
    smoothZoom(window.map, 19, window.map.getZoom())
    window.map.setCenter(trails.chinatown.location)
}

var rad = function (x) {
    return x * Math.PI / 180;
};

function getDistance(mk1, mk2) {
    var R = 6378137; // Radius of the Earth in miles
    var rlat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)
    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
}

function recenterLogic(origin) {
    map = window.map
    map.addListener("drag", () => {
        centered = false
    })

    document.getElementById("recenter").addEventListener("click", () => {
        centered = true
        map.setCenter(origin)
        map.setZoom(16);
    })
    if (centered) {
        map.setCenter(origin)
        map.setZoom(16);
    }
}

var localStorage = window.localStorage
if (localStorage.getItem('landmarkIndex')) {
    var landmarkIndex = parseInt(localStorage.getItem('landmarkIndex'));
} else {
    localStorage.setItem('landmarkIndex', 0);
    var landmarkIndex = 0
}


// getting places from REST APIs
function loadPlaceFromAPIs(position) {
    const params = {
        radius: 300, // search places not farther than this value (in meters)
        clientId: '02NGKRBHAJWSG12JYET2RJYPUO15NORA4NS5AOGYOYIB3HLJ',
        clientSecret: '2OAVJC42O2WX4A3OV43WOF45WNBYUMD2PXSWZKYISXTI2JBW',
        version: '20300101', // foursquare versioning, required but unuseful for this demo
    };
    //fsq3le97hiGWeeRpJV36GITy5TsUqDH7mZD0wR3ueXSf3l0=
    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};

function click(open,leg) {
    if (open == false) {
        $('#instructions').css('overflow', 'scroll');
        $('#instructions').css('height', '25%');
        $('#instructions').css('margin', '10px');
        //margin-top: 10px;
        //$('#instructions').css('margin-top', '10px');
        var table = document.createElement('table')
        var count = 0;
        leg['steps'].forEach(step => {

            var row = table.insertRow();
            var cell = row.insertCell();
        
            var text = step.instructions + " " + step.distance.text + " " + step.duration.text

            var spanVal = '';
            console.log("wrap"+count);

            let iconName = step.instructions.toString();
            if (iconName.includes('west')){
                spanVal = 'turn_left';
                console.log((iconName.includes('west')));
            }
            if (iconName.includes('east')){
                spanVal = 'turn_right';
            }
            if (iconName.includes('left')){
                spanVal = 'turn_left';
            }
            if (iconName.includes('right')){
                spanVal = 'turn_right';
            }
            if (iconName.includes('south')){
                spanVal = 'south';
            }
            if (iconName.includes('south-east')){
                spanVal = 'south_east';
            }
            if (iconName.includes('south-west')){
                spanVal = 'south_west';
            }
            if (iconName.includes('north')){
                spanVal = 'north';
            }
            if (iconName.includes('north-east')){
                spanVal = 'north_east';
            }
            if (iconName.includes('north-west')){
                spanVal = 'north_west';
            }
            if (iconName.includes('Continue')){
                spanVal = 'directions_walk';
            }
            
            //or json get number
            text = "<br><div><span id='wrap' class='material-icons md-36'>" + spanVal + "</span></div><div style='margin:auto'>" + "(WP" + (leg['steps'].indexOf(step)+1).toString() + ") " +  step.instructions + " " + step.distance.text + " " + step.duration.text +' </div>'
            cell.style = "width:100%;text-align: center;justify-content: center;align-items: center;display:inline-flex";
            
            if(count == 0) {
                var uparrow = "<div><i class='fas fa-angle-double-down'></i><div>"
                text +=uparrow;
            }

            console.log(step.maneuver);

            count++;
            cell.innerHTML = text;
        });

        var height = $('#instructions').height();
        console.log(height, 'h')
        table.style = 'height:' + height + 'px';
        //var uparrow = "<div><i class='fas fa-angle-double-down'></i><div>"
        // var uparrow = "<div style='margin-top: 15px; width: 40px;'><i class='fas fa-angle-double-down'></i><div>";
        //document.getElementById("instructions").innerHTML = uparrow;

        // var iconDiv = document.createElement('div');
        // var iconI = document.createElement('i');
        // iconI.className = 'fas fa-angle-double-down';
        // iconDiv.appendChild(iconI);
        // table += iconDiv;
        // $('#instructions').html(table);
        // isopen = true;

        //table.append(uparrow);
        $('#instructions').html(table);
        isopen = true;
    }
    else {
        instructions = "<h1><span id='wrap' class='material-icons md-48'></span><div style='margin:10px;'>" + "(WP1) " + leg["steps"][0].instructions + " " + leg["steps"][0].distance.text + "  " + leg["steps"][0].duration.text + "</div></h1><hr>"
        var uparrow = "<div style='width: 40px;'><i class='fas fa-angle-double-down'></i><div>"
        instructions += uparrow;
        $("#instructions").css('display', 'inline-flex');
        $('#instructions').css('height', '15%');
        $('#instructions').css('margin', '10px');
        document.getElementById("instructions").innerHTML = instructions
        $('#instructions').on('click', function () {
            click(isopen,leg);
        });

        let iconName = leg.steps[0].maneuver.toString();
        if (iconName.includes('west')){
            document.getElementById("wrap").innerText = 'turn_left';
            console.log((iconName.includes('west')));
        }
        if (iconName.includes('east')){
            document.getElementById("wrap").innerText = 'turn_right';
        }
        if (iconName.includes('left')){
            document.getElementById("wrap").innerText = 'turn_left';
        }
        if (iconName.includes('right')){
            document.getElementById("wrap").innerText = 'turn_right';
        }
        if (iconName.includes('south')){
            document.getElementById("wrap").innerText = 'south';
        }
        if (iconName.includes('south-east')){
            spanVal = 'south_east';
        }
        if (iconName.includes('south-west')){
            spanVal = 'south_west';
        }
        if (iconName.includes('north')){
            spanVal = 'north';
        }
        if (iconName.includes('north-east')){
            spanVal = 'north_east';
        }
        if (iconName.includes('north-west')){
            spanVal = 'north_west';
        }
        if (iconName.includes('Continue')){
            document.getElementById("wrap").innerText = 'directions_walk';
        }

        isopen= false;
    }
}

window.onload = () => {

    alert("Please be outdoors to start the navigation.");

    const scene = document.querySelector('a-scene');

    var trail = localStorage.getItem('Trail');
    if (trail == 'Chinatown') {
        trail = Chinatown;
    } else if (trail == 'nyp') {
        trail = nyp;
    } else if (trail == 'home') {
        trail = home;
    }
    // first get current user location

    return navigator.geolocation.getCurrentPosition(function (position) {
//had a long code, refer to devOps to retrieve back

            // 1 marker
            var queryString = decodeURIComponent(window.location.search).substring(1);
            trail.forEach((place) => {
                console.log(place);
                console.log(place.legend == queryString,place.legend,queryString)

                for (let i = 0; i < trail.length; i++) { 
                    if (textdistance[i].title == place.legend) {
                    console.log("HEELO");
                    var origin = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;
                    const content = place.content;
                    const src = place.src;

                    const container1 = document.createElement('a-entity');
                    container1.setAttribute("position", '0 25 0');
                    container1.setAttribute('alpha-test', '0.50');
                    container1.setAttribute('id', 'LM' + i.toString());
                    container1.id = 'LM' + i.toString();

                //     <a-entity id="DirectionContainer">
                //     <a-image id="DirectionBorder"></a-image>
                //     <a-entity id="DirectionText"></a-entity>
                //     <a-entity id="DirectionMetre"></a-entity>
                //   </a-entity>
              
                //   <a-entity id="ArrowContainer">
                //     <a-entity id="DirectionArrow"></a-entity>
                //   </a-entity>

                    const container2 = document.createElement('a-entity');
                    container2.setAttribute("position", '0 26 0');

                    const icon = document.createElement('a-image');
                    // console.log(icon.components.camera.camera);
                    // text.setAttribute("name",place.name);
                    //icon.setAttribute('title', place.name);
                    
                    //https://aframe.io/docs/1.3.0/primitives/a-image.html
                    icon.setAttribute("scale", '35 20 20');
                    // icon.setAttribute("width", '60');
                    // icon.setAttribute("height", '30');
                    icon.setAttribute("look-at", "[gps-camera]");
                    icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
                    
                    var locationChosen = decodeURIComponent(window.location.search);
                    locationChosen = locationChosen.replace("?", "");
                    
                    console.log(locationChosen);
                    if (textdistance[i].title == locationChosen) { 
                        icon.setAttribute('src', './Trails/assets/navImage.png');
                    }
                    else {
                        icon.setAttribute('src', './Trails/assets/navImageGrey.png');
                    }
                    icon.setAttribute("position", '0 0 0');
                    icon.setAttribute('material', 'opacity: 0.85;');
                    //icon.setAttribute("baseline", 'top');
                    //icon.setAttribute("align", 'center');
                    icon.setAttribute('alpha-test', '0.50');
                    //icon.setAttribute('zOffset', '5');
                    //icon.setAttribute("width", '');
            


                    //const textdistance = document.createElement('a-text');
                    
                    // textdistance[i].element.setAttribute("font-image", './Trails/assets/LondrinaOutline-Regular.png');
                    // textdistance[i].element.setAttribute("font", './Trails/assets/LondrinaOutline-Regular.json');

                    //textdistance[i].element.setAttribute("negate", 'false');
                    //textdistance[i].element.setAttribute("baseline", 'top');
                    
                    const container3 = document.createElement('a-entity');
                    container3.setAttribute("position", '0 25 0');
                    //container3.setAttribute('alpha-test', '0.50');
                    //container3.setAttribute('zOffset', '5');
                    //container2.setAttribute("look-at", "[gps-camera]");
                    //container2.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);

                    placenames[i].element.setAttribute("align", 'center');
                    //placenames[i].element.setAttribute("baseline", 'top');
                    placenames[i].element.setAttribute('alpha-test', '0.50');
                    placenames[i].element.setAttribute("scale", '12 12 12');
                    placenames[i].element.setAttribute("font-size", '5');
                    placenames[i].element.setAttribute("look-at", "[gps-camera]");
                    placenames[i].element.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
                    placenames[i].element.setAttribute("color", 'black');
                    placenames[i].element.setAttribute("id", 'distancetext');
                    placenames[i].element.setAttribute("distancetext", '');
                    placenames[i].element.setAttribute("position", '0 0 0'); //'-12 40 -20'

                    textdistance[i].element.setAttribute("align", 'center');
                    //textdistance[i].element.setAttribute("baseline", 'bottom');
                    textdistance[i].element.setAttribute('alpha-test', '0.50');
                    textdistance[i].element.setAttribute("scale", '20 20 20');
                    textdistance[i].element.setAttribute("look-at", "[gps-camera]");
                    textdistance[i].element.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
                    
                    //Define shape and color first //
                    // textdistance[i].element.setAttribute("geometry", 'primitive: box; width: 20; height: 20');
                    // textdistance[i].element.setAttribute("material", 'color: red');
                    
                    textdistance[i].element.setAttribute("color", 'black');
                    //textdistance[i].element.setAttribute("height", '100');
                    textdistance[i].element.setAttribute("id", 'distancetext');
                    textdistance[i].element.setAttribute("distancetext", '');
                    textdistance[i].element.setAttribute("position", '0 0 0'); //'-12 40 -20'
                    //textdistance[i].element.setAttribute('alpha-test', '0.50');
                    //textdistance[i].element.setAttribute('zOffset', '5');
                    // console.log("RUNNIGN THROUGH HERE");
                    // console.log(testPointers(origin));                


                    // const distanceTex = document.createElement('a-entity');
                    // distanceTex.setAttribute("align", 'center');
                    // distanceTex.setAttribute('position','0 0 0');
                    // distanceTex.setAttribute('troika-text','color: black; value: Hello world!');
                    // //distanceTex.setAttribute('color','black');
                    // distanceTex.setAttribute('troika-text-material',"shader: standard; metalness: 0.8;");
                    // distanceTex.setAttribute("scale", '20 20 20');
                    // distanceTex.setAttribute("look-at", "[gps-camera]");
                    // distanceTex.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
                    // distanceTex.setAttribute('alpha-test', '0.50');
                    //distanceTex.setAttribute('zOffset', '50');

                    var id = place.legend;
                    console.log(id);
                    icon.id = id.toLowerCase();
                    
                    //<a-sphere color="yellow" radius="50"></a-sphere>
                    // const sphere = document.createElement('a-sphere');
                    // sphere.setAttribute("color", 'yellow');
                    // sphere.setAttribute("radius", '50');

                    if (textdistance[i].element.id != '') {
                        console.log(textdistance[i].element.id);
                        //console.log(textdistance.text);
                        console.log(textdistance[i].element.value);
                    }
                    else {
                        console.log('no id');
                    }
                    queryString = queryString.substring(1);

                    if (queryString.toLowerCase() == id) {

                        AFRAME.registerComponent(id, {
                            init: function () {
                                setInterval(function () {

                                    //document.getElementById(distancetext).setAttribute('value', 'New');
                                    console.log('changing');
                                    var cam = $('#cam')[0].object3DMap.camera;
                                    if (cam) {
                                        console.log(cam);
                                        var frustum = new THREE.Frustum();
                                        var matrix = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,
                                            cam.matrixWorldInverse)
                                        frustum.setFromProjectionMatrix(matrix);
                                        // Your 3d point to check
                                        var overlay = $('#overlay');

                                        var pos = document.getElementById(id.toLowerCase()).getAttribute("position");
                                        var distance = getDistance(origin, place.location);
                                        // console.log(distance, place.location, origin, "DISTNACE");
                                        if (frustum.containsPoint(pos)) {
                                            // Do something with the position...
                                            console.log("IN VIEW");
                                            overlay.css('display', "none");
                                            overlay.css('z-index', '1');
                                        } else {
                                            if (distance && distance < 50) {
                                                overlay.css('display', 'block');
                                                overlay.css('z-index', '9999');
                                            }
                                            console.log("not in view")

                                            console.log(pos);
                                        }
                                    }
                                }, 1000)
                            }
                        })
                    }
                    const clickListener = function (ev) {
                        ev.stopPropagation();
                        ev.preventDefault();

                        const name = ev.target.getAttribute('name');

                        const el = ev.detail.intersection && ev.detail.intersection.object.el;

                        if (el && el === ev.target) {
                            const label = document.createElement('span');
                            const container = document.createElement('div');
                            const para = document.createElement('p');
                            const butt = document.createElement('a');
                            const image = document.createElement('img');
                            image.setAttribute("style", "width:0.8cm;height0.8cm;opacity:0.95;margin-right:10px;");
                            image.setAttribute("src", "./Trails/assets/125-1258034_free-download-and-vector-speaker-icon-animated-gif-removebg-preview.png");
                            image.onclick = function () {
                                let utterance = new SpeechSynthesisUtterance(extraContent);
                                speechSynthesis.speak(utterance);
                            }
                            butt.setAttribute('class', 'button');
                            butt.setAttribute('href', src);
                            butt.setAttribute('style', 'border-radius:4px;background-color:#555555;text-color:#808080');
                            container.setAttribute('id', 'place-label');
                            label.innerText = place.name;
                            para.innerText = place.content;
                            extraContent = place.extraContent;
                            butt.innerText = "More Info";
                            container.appendChild(label);
                            label.appendChild(para);
                            label.appendChild(image);

                            label.appendChild(butt);
                            var indexoflandmark = trail.indexOf(place);
                            console.log("INDEX", indexoflandmark);
                            
                            var placeName = localStorage.getItem('Trail');
                            console.log("TRAIL", placeName);

                            butt.addEventListener('click', markDone(placeName, indexoflandmark));
                            document.body.appendChild(container);
                            image.addEventListener('click', textSPeech);
                            setTimeout(() => {
                                container.parentElement.removeChild(container);
                            }, 3500);
                        }
                    };

                    icon.addEventListener('click', clickListener);
                    scene.setAttribute(id, '');
                    
                    //https://github.com/aframevr/aframe/issues/3822 > To prevent text flickering
                    
                    container1.appendChild(icon);
                    container1.appendChild(placenames[i].element);
                    container1.appendChild(textdistance[i].element);

                    //container1.appendChild(container3);
                    
                    //container1.appendChild(icon);
                    scene.appendChild(container1);
                    // scene.appendChild(container2);
                    // scene.appendChild(icon);
                    // scene.appendChild(distanceTex);
                }
            }
        });
        console.log('DONE CREATING AR MARKERS');
        },
        (err) => console.error('Error in retrieving position', err), {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 30000,
        }
    );
};

//code for the text to speech
function textSPeech() {
    console.log("hello world");
}

function markDone(trail, landmarkindex) {
    // var trail = trail;
    // console.log(trail);
    var currentProgress = localStorage.getItem(trail + ' Progress');
    console.log(currentProgress);
    currentProgress = JSON.parse(localStorage.getItem(trail + ' Progress'));
    console.log(currentProgress);
    currentProgress[landmarkindex] = 1;
    currentProgress = JSON.stringify(currentProgress)
    localStorage.setItem(trail + ' Progress', currentProgress);
    var bullets = document.querySelectorAll('#ProgressBar')
    console.log(bullets[landmarkindex].getElementsByClassName('bullets'));
    bullets[landmarkindex].getElementsByClassName('bullets')[0].classList.add('completed');
}


//code for the drop down menu
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

$('#dialog').dialog({
    height: "auto",
    width: 400,
    autoOpen: false,
    modal: true,
    buttons: [{
        text: "Ok",
        id: "Ok",
        click: function () {
            $(this).dialog("close")
        }
    }]
})

function currentPositionSuccess(position) {
    // Icons
    var icons = {
        marker: {
            labelOrigin: new google.maps.Point(11, -12),
            url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png", // red marker
            size: new google.maps.Size(22, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11, 40),
        }
    };
    origin = {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
    }
        
    window.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        },
        zoomControl: false,
        disableDefaultUI: true,
        keyboardShortcuts: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        styles: [{
                featureType: "poi",
                elementType: "labels",
                stylers: [{
                    visibility: "off"
                }]
            },
            {
                featureType: "transit",
                elementType: "labels.icon",
                stylers: [{
                    visibility: "off"
                }],
            },
        ],
    });
    const map = window.map;
    // map.addListener('drag', function () {
    //     markers['user'].setAnimation(null);
    // })
    // map.addListener('click', function () {
    //     markers['user'].setAnimation(null);
    // })
    var backbtn = document.getElementById('back');
    var mapdiv = document.getElementById('map');
    var recetnerBtn = document.getElementById("recenter");
    google.maps.event.addListener(map, "click", function (event) {
        var progress = document.getElementById('Progress');
        var camera = document.getElementById('camera');
        progress.style.display = 'None';
        console.log("CLICKED", mapdiv);
        camera.style.display = 'None';
        mapdiv.style.height = '100%';
        mapdiv.style.width = '100%';
        mapdiv.style.right = '0';
        mapdiv.style.bottom = '0';
        if (window.map.controls[google.maps.ControlPosition.LEFT_TOP].length == 0) {
            window.map.controls[google.maps.ControlPosition.LEFT_TOP].push(backbtn);
            window.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(recetnerBtn);
            backbtn.onclick = function () {
                mapdiv.style.position = 'absolute';
                mapdiv.style.height = '20%';
                mapdiv.style.width = '85%';
                mapdiv.style.left = '75px';
                mapdiv.style.bottom = '15px';
                window.map.controls[google.maps.ControlPosition.LEFT_TOP].pop();
                window.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
                progress.style.display = 'flex';
                camera.style.display = 'block';
                map.setCenter(origin);
            }
        }
    });
}

function makeuserlocation(position, icon, title, map) {
    var id = 'user';
    var exist = markers[id];

    if (!exist) {
        console.log('here');
        marker = new google.maps.Marker({

            position: position,
            label: {
                color: 'black',
                fontWeight: 'bold',
                text: title,
                fontSize: '35px',
            },
            map: map,
            icon: icon,
            title: title,
            id: id,
            //animation: google.maps.Animation.BOUNCE,
        });
        markers[id] = marker;
    } else {
        exist.setMap(null);
        marker = new google.maps.Marker({

            position: position,
            label: {
                color: 'black',
                fontWeight: 'bold',
                text: title,
                fontSize: '35px',
            },
            map: map,
            icon: icon,
            title: title,
            id: 'user',
            //animation: google.maps.Animation.BOUNCE,
        });
        markers[id] = marker;
    }
    return marker
}

var localStorage = window.localStorage
localStorage.setItem('navOnce', false);
console.log('ONLY ONCE TO RUN', localStorage.getItem('navOnce'), false);
var count = 0;

function success(position) {
    
    //how many times success runs
    count++;
    console.log(count);

    var origin = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    recenterLogic(origin);
    const map = window.map;
    
    makeuserlocation(origin, "assets/img/userLocation.png", "You", map);
    
    directionsService = new google.maps.DirectionsService();
    directionRenderer = new google.maps.DirectionsRenderer({
        preserveViewport: true
    });

    directionRenderer.setMap(map);
    directionRenderer.setOptions({
        suppressMarkers: true
    });

    var queryString = decodeURIComponent(window.location.search).substring(1);
    icon = document.querySelector("a-image");
    var localStorage = window.localStorage;
    var trail = localStorage.getItem('Trail');
    
    console.log("TRAIL:", trail)
    console.log(flag);

    if (trail == 'Chinatown') {
        setInterval(
            function() {
                for (i = 0; i < Chinatown.length; i++) {
    
                destinationLocation = Chinatown[i].location;
                destination = Chinatown[i].name;

                var disvalue = Math.round(getDistance(origin, destinationLocation));
                // console.log(disvalue);
                // console.log(destination);
                textdistance[i].element.setAttribute("troika-text", `baseline: bottom; color: white; value: ${destination};`);
                placenames[i].element.setAttribute("troika-text", `baseline: top; color: white; value: \n${disvalue}m Away;`);
                //console.log(textdistance[i].element.getAttribute('text'));
            }
        }
        ,1000);
    }
    if (trail == 'nyp') {
        setInterval(
            function() {
                for (i = 0; i < nyp.length; i++) {
    
                destinationLocation = nyp[i].location;
                destination = nyp[i].name;

                var disvalue = Math.round(getDistance(origin, destinationLocation));
                // console.log(disvalue);
                // console.log(destination);
                textdistance[i].element.setAttribute("troika-text", `baseline: bottom; color: white; value: ${destination};`);
                placenames[i].element.setAttribute("troika-text", `baseline: top; color: white; value: \n${disvalue}m Away;`);
                //console.log(textdistance[i].element.getAttribute('text'));
            }
        }
        ,1000);
    }
    if (trail == 'home') {
        setInterval(
            function() {
                for (i = 0; i < home.length; i++) {
    
                destinationLocation = home[i].location;
                destination = home[i].name;

                var disvalue = Math.round(getDistance(origin, destinationLocation));
                // console.log(disvalue);
                // console.log(destination);
                // textdistance[i].element.setAttribute("text", `baseline: top; align: center; color: black; value: ${destination} \n ${disvalue}m Away; shader: msdf; font:https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/fascinateinline/FascinateInline-Regular.json;`);
                textdistance[i].element.setAttribute("troika-text", `baseline: bottom; color: white; value: ${destination};`);
                placenames[i].element.setAttribute("troika-text", `baseline: top; color: white; value: \n${disvalue}m Away;`);
                //console.log(textdistance[i].element.getAttribute('text'));
            }
        }
        ,1000);
    }

    if (queryString == 'BlockL') {
        destinationLocation = nyp[0].location;
        destination = nyp[0].name;
    } else if (queryString == 'BlockA') {
        destinationLocation = nyp[1].location;
        destination = nyp[1].name;
    }
    if (flag) {
        flag = false
        directionRenderer.set('directions', null)
        console.log("ROUTING");
        //displayRoute(origin, destination, destinationLocation, "WALKING")
    }


    //stopRouteLineMarkersRepeat

    // MAKE USE OF QUERY STRING TO CONTROL WHICH ROUTE TO NAVIGATE
    //queryString
    
    //var localStorage = window.localStorage;
    //var trail = localStorage.getItem('Trail');
    var queryString = decodeURIComponent(window.location.search).substring(1);

    // console.log(trail);
    console.log(queryString);

    if (trail == 'Chinatown') {
        for (i = 0; i < Chinatown.length; i++) {
            if (Chinatown[i].legend == queryString) { 
                console.log(Chinatown[i].location.lat());
                console.log(Chinatown[i].location.lng());
                localStorage.setItem('selectedLandmarklat', Chinatown[i].location.lat());
                localStorage.setItem('selectedLandmarklng', Chinatown[i].location.lng());
            }
        }
    } else if (trail == 'nyp') {
        for (i = 0; i < nyp.length; i++) {
            console.log(nyp[i].legend);
            console.log(queryString);
            if (nyp[i].legend == queryString) { 
                // console.log(nyp[i].location.lat);
                // console.log(nyp[i].location.lng);
                localStorage.setItem('selectedLandmarklat', nyp[i].location.lat);
                localStorage.setItem('selectedLandmarklng', nyp[i].location.lng);
            }
        }
    } else if (trail == 'home') {
        for (i = 0; i < home.length; i++) {
            if (home[i].legend == queryString) { 
                console.log(home[i].location.lat);
                console.log(home[i].location.lng);
                localStorage.setItem('selectedLandmarklat', home[i].location.lat);
                localStorage.setItem('selectedLandmarklng', home[i].location.lng);
            }
        }
    }

    var selectedLandmarklat = parseFloat(localStorage.getItem('selectedLandmarklat'));
    var selectedLandmarklng = parseFloat(localStorage.getItem('selectedLandmarklng'));

    //https://stackoverflow.com/questions/9311498/change-the-color-of-the-polyline-in-directionsrenderer
    directionsService.route({
        origin: origin,
        destination: 
        {
            lat: selectedLandmarklat,
            lng: selectedLandmarklng
        },
        travelMode: google.maps.TravelMode["WALKING"],
    }).then((response) => {

        //https://stackoverflow.com/questions/9594598/add-markers-along-a-route
        google.maps.Polyline.prototype.GetPointsAtDistance = function(metres) {
            var next = metres;
            var points = [];

            if (metres <= 0) 
                return points;
            var dist = 0;
            var olddist = 0;
            for (var i = 1;
                (i < this.getPath().getLength()); i++) {
                olddist = dist;
                dist += google.maps.geometry.spherical.computeDistanceBetween(this.getPath().getAt(i), this.getPath().getAt(i - 1));
                while (dist > next) {
                var p1 = this.getPath().getAt(i - 1);
                var p2 = this.getPath().getAt(i);
                var m = (next - olddist) / (dist - olddist);
                points.push(new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m));
                next += metres;
                }
            }
            return points;
        }

        var legs = response.routes[0].legs;
        const route = response.routes[0];
        var leg = route.legs[0];

        console.log(legs);
        console.log(leg);

        //if (getnavOnce == "false" || getnavOnce == "true") { 
            instructions = "<h1><span id='wrap' class='material-icons md-48'></span><div style='margin:10px;'>" + "(WP1) " + leg["steps"][0].instructions + " " + leg["steps"][0].distance.text + "  " + leg["steps"][0].duration.text + "</div></h1><hr>"
            //instructions = "<h1 style='margin: 10px; width: 100px; position: relative;'><span id='wrap' class='material-icons md-48'></span><div style='height: 48px; position: relative;'>" + leg["steps"][0].instructions + " " + leg["steps"][0].distance.text + "  " + leg["steps"][0].duration.text + "</div></h1><hr>"            
            var uparrow = "<div style='width: 40px;'><i class='fas fa-angle-double-down'></i><div>"
            instructions += uparrow;
            $("#instructions").css('display', 'inline-flex')
            $("#instructions").css('margin', '10px')
            document.getElementById("instructions").innerHTML = instructions
            $('#instructions').on('click', function () {
                click(isopen,leg);
            });
            
            let iconName = leg["steps"][0].instructions.toString();
            if (iconName.includes('west')){
                document.getElementById("wrap").innerText = 'turn_left';
                console.log((iconName.includes('west')));
            }
            if (iconName.includes('east')){
                document.getElementById("wrap").innerText = 'turn_right';
            }
            if (iconName.includes('left')){
                document.getElementById("wrap").innerText = 'turn_left';
            }
            if (iconName.includes('right')){
                document.getElementById("wrap").innerText = 'turn_right';
            }
            if (iconName.includes('south')){
                document.getElementById("wrap").innerText = 'south';
            }
            if (iconName.includes('south-east')){
                spanVal = 'south_east';
            }
            if (iconName.includes('south-west')){
                spanVal = 'south_west';
            }
            if (iconName.includes('north')){
                spanVal = 'north';
            }
            if (iconName.includes('north-east')){
                spanVal = 'north_east';
            }
            if (iconName.includes('north-west')){
                spanVal = 'north_west';
            }
            if (iconName.includes('Continue')){
                document.getElementById("wrap").innerText = 'directions_walk';
            }
        //}

        console.log('ONLY ONCE TO RUN', localStorage.getItem('navOnce'));
        
        var getnavOnce = localStorage.getItem('navOnce');
        var bounds = new google.maps.LatLngBounds();

        if (getnavOnce == "false") {
            console.log(localStorage.getItem('navOnce') == false);
            
            var endMarker = new google.maps.Marker({
                position: {
                    lat: selectedLandmarklat,
                    lng: selectedLandmarklng
                },
                map: map,
            });
            gMarkers.push(endMarker);

            var polyline = new google.maps.Polyline({
                path: [],
                strokeColor: '#FF0000',
                strokeWeight: 4,
                strokeOpacity: 0.4
            });

            startLocation = new Object();
            endLocation = new Object();

            var legs = response.routes[0].legs;
            const route = response.routes[0];
            var leg = route.legs[0];
            
            for (i = 0; i < legs.length; i++) {
                if (i == 0) {
                    startLocation.latlng = legs[i].start_location;
                    startLocation.address = legs[i].start_address;
                }
                endLocation.latlng = legs[i].end_location;
                endLocation.address = legs[i].end_address;
                var steps = legs[i].steps;
                for (j = 0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (k = 0; k < nextSegment.length; k++) {
                    polyline.getPath().push(nextSegment[k]);
                    //console.log(k, nextSegment[k]);
                    bounds.extend(nextSegment[k]);
                    }
                }
            }
            console.log(polyline.getPath());
            //NavPointers.push(polyline.getPath());
        
        // Issue:
        // - entities and polyline looping, at success method try to delete it
        // - the entities don't disappear as it functions like the landmark locations, maybe control the distance
        // thingy? rearrange the location coordinate in school, so routing would be much easier.
        // - also, might need to use 3d objects to guide the user as im not aware the direction im facing
        // the entity. with shadow i might know if im closer to it.
        // - put up an alert to inform the person to be outdoors first, then continue the trail, maybe can place
        // a click event first on the outdoor marker then when the person clicks.

        // markless AR means no image or face tracking to let the AR appear, but location based

            console.log('DIRECTION INFORMATION', response.routes[0].legs[0].steps[0].maneuver);
            console.log('DIRECTION INFORMATION', response.routes);

            console.log(polyline);
            polyline.setMap(window.map);
            var points = polyline.GetPointsAtDistance(30);
            
            //localStorage.setItem('delPolyline', JSON.stringify(polyline));

            console.log('VALUE OF POINTS', points);
            console.log('NO OF POINTS', points.length);
            // for (var pointer = 0; pointer < points.length; pointer++) {
            //     console.log('POINT COORDINATES', `latitude: ${points[pointer].lat()}; longitude: ${points[pointer].lng()};`);
            // }

            const scene = document.querySelector('a-scene');

            const delText = document.querySelectorAll('a-text');
            const delNavs = document.getElementsByClassName("navIcons");

            console.log('ALL A-TEXT', delText.length);
            console.log('ALL ICONS', delNavs.length);
        }; // END OF RUN ONCE LOOP

        localStorage.setItem('navOnce', true);
        console.log('ONLY ONCE TO RUN', localStorage.getItem('navOnce'));

            // if (delText.length != 0) {
            //     for (i = 0; i < points.length; i++) {
            //        scene.removeChild(delText[i]);   
            //        scene.removeChild(delNavs[i]);   
            //     } 
            // }
            
            // console.log('DELETION OF A-TEXT', delText.length); 
            // console.log('DELETION OF ICONS', delNavs.length);

            //Alert to notify the user to be outdoors, else indoors the AR wouldn't
            //work at all.
            
            //for (var pointer = 0; pointer < points.length; pointer++) {
                
                //Using Clara.io to make 3D Model

            for (i = 0; i <  leg["steps"].length; i++) { 
                var firstWaypoint = new google.maps.Marker({
                    position: {
                        lat: leg["steps"][i].end_location.lat(),
                        lng: leg["steps"][i].end_location.lng()
                    },
                    map: map,
                });
                gMarkers.push(firstWaypoint);
            }

            if (document.getElementById('PosId') && document.getElementById('NavId')) {
                document.getElementById('PosId').remove();
                console.log('posid remove');
                document.getElementById('NavId').remove();
                console.log('navid remove');
            }

                // const arrowPos = document.getElementById("ArrowContainer");
                const arrowPos = document.createElement('a-entity');
                arrowPos.setAttribute("position", '0 -15 0');
                arrowPos.setAttribute('id', 'PosId');
                arrowPos.id = 'PosId';
                //arrowPos.setAttribute("look-at", "[gps-camera]");

                //nyp
                // var lat = 1.3789360382066367;
                // var lng = 103.8500673058269;

                //home
                // var lat = 1.427992;
                // var lng = 103.834022;
                
                //flexible direction
                var lat = leg["steps"][0].end_location.lat().toString();
                var lng = leg["steps"][0].end_location.lng().toString();

                //`latitude: ${leg["steps"][0].end_location.lat().toString()}; longitude: ${leg["steps"][0].end_location.lng()};`
                
                //arrowPos.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
                
                //rotation="0 45 0"
                //arrowPos.setAttribute("rotation", '45 45 45');

                // const arrowModel = document.getElementById("DirectionArrow");
                const arrowModel = document.createElement('a-entity');
                if (iconName.includes('west')){
                    arrowModel.setAttribute("gltf-model", '#arrowL');
                    console.log((iconName.includes('west')));
                }
                if (iconName.includes('east')){
                    arrowModel.setAttribute("gltf-model", '#arrowR');
                }
                if (iconName.includes('left')){
                    arrowModel.setAttribute("gltf-model", '#arrowL');
                }
                if (iconName.includes('right')){
                    arrowModel.setAttribute("gltf-model", '#arrowR');
                }
                if (iconName.includes('south')){
                    arrowModel.setAttribute("gltf-model", '#arrowS');
                }
                if (iconName.includes('south-east')){
                    arrowModel.setAttribute("gltf-model", '#arrowSE');
                }
                if (iconName.includes('south-west')){
                    arrowModel.setAttribute("gltf-model", '#arrowSW');
                }
                if (iconName.includes('north')){
                    arrowModel.setAttribute("gltf-model", '#arrowN');
                }
                if (iconName.includes('north-east')){
                    arrowModel.setAttribute("gltf-model", '#arrowNE');
                }
                if (iconName.includes('north-west')){
                    arrowModel.setAttribute("gltf-model", '#arrowNW');
                }
                if (iconName.includes('Continue')){
                    arrowModel.setAttribute("gltf-model", '#arrowN');
                }
    
                arrowModel.setAttribute("scale", '2 2 2');
                arrowModel.setAttribute("position", '0 0 0');
                arrowModel.setAttribute('material', 'opacity: 0.85;');
                arrowModel.setAttribute("look-at", "[gps-camera]");
                arrowModel.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
                //arrowModel.setAttribute("rotation", '0 45 0');

                // const container1 = document.getElementById("DirectionContainer");
                const container1 = document.createElement('a-entity');
                container1.setAttribute("position", '0 5 0');
                container1.setAttribute('alpha-test', '0.50');
                container1.setAttribute('id', 'NavId');
                container1.id = 'NavId';

                // const icon = document.getElementById("DirectionBorder");
                const icon = document.createElement('a-image');
                icon.setAttribute("scale", '35 20 20');
                icon.setAttribute("look-at", "[gps-camera]");
                icon.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
                icon.setAttribute("position", '0 0 0');
                icon.setAttribute('material', 'opacity: 0.85;');
                icon.setAttribute('alpha-test', '0.50');
                icon.setAttribute('src', './Trails/assets/navImage.png');

                // const directionText = document.getElementById("DirectionText");
                const directionText = document.createElement('a-entity');
                directionText.setAttribute("align", 'center');
                directionText.setAttribute("baseline", 'top');
                directionText.setAttribute('alpha-test', '0.50');
                directionText.setAttribute("scale", '10 10 10');
                //directionText.setAttribute("font-size", '5');
                directionText.setAttribute("look-at", "[gps-camera]");
                directionText.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
                directionText.setAttribute("color", 'white');
                directionText.setAttribute("outline-color", 'black');
                directionText.setAttribute("maxWidth", '3px');
                directionText.setAttribute("wrapCount", '5');
                directionText.setAttribute("position", '0 0 0'); //'-12 40 -20'
                
                var textVal = leg["steps"][0].instructions.toString();
                textVal = textVal.replaceAll('</b>','');
                textVal = textVal.replaceAll('<b>','');
                console.log(textVal);

                directionText.setAttribute("troika-text", `align: center; maxWidth: 2.8px; baseline: bottom; color: white; value: ${textVal};`);
                // directionText.setAttribute("id", 'distancetext');
                // directionText.setAttribute("distancetext", '');

                //if looping, maybe insert a-entity in the html
                //then replace with set attribute

                //const metreText = document.getElementById("DirectionMetre");;
                const metreText = document.createElement('a-entity');
                metreText.setAttribute("align", 'center');
                metreText.setAttribute("baseline", 'top');
                metreText.setAttribute('alpha-test', '0.50');
                metreText.setAttribute("scale", '7.5 7.5 7.5');
                //directionText.setAttribute("font-size", '5');
                metreText.setAttribute("look-at", "[gps-camera]");
                metreText.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
                metreText.setAttribute("color", 'white');
                metreText.setAttribute("outline-color", 'black');
                metreText.setAttribute("maxWidth", '3px');
                metreText.setAttribute("wrapCount", '5');
                metreText.setAttribute("position", '0 0 0'); //'-12 40 -20'
                
                var textVal = leg["steps"][0].distance.text.toString();
                metreText.setAttribute("troika-text", `outlineColor: black; maxWidth: 2.8px; baseline: top; color: white; value: \n\n\n${textVal};`);

                const aText = document.createElement('a-text');
                aText.setAttribute("position", '0 0 0');
                aText.setAttribute("align", 'center');
                aText.setAttribute("scale", '20 20 20');
                //directionMarker.setAttribute("translate", '0 3 0'); //make it stick to the ground(?)
                aText.setAttribute("color", 'white');
                //directionMarker.setAttribute("radius", '1.5');
            
                //aText.setAttribute("value", textVal);
                aText.setAttribute("look-at", "[gps-camera]");
                aText.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lng};`);
                // console.log('A-TEXT COORDINATES', `latitude: ${points[pointer].lat()}; longitude: ${points[pointer].lng()};`);

                const scene = document.querySelector('a-scene');

                arrowPos.appendChild(arrowModel);
                container1.appendChild(icon);
                container1.appendChild(directionText);
                container1.appendChild(metreText);

                //https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
                // const LM7 = document.getElementById('LM2');
                // LM7.after(arrowPos);
                // LM7.after(container1);
                scene.appendChild(arrowPos);
                scene.appendChild(container1);

            //}
        
        //console.log('APPEARANCE OF A-SPHERES', directionMarker);
        //console.log('NO OF A-SPHERES', directionMarker.length);
    })
}

function errorHandler(err) {
    if (err.code == 1) {
        alert("Error: Access is denied!");
    } else if (err.code == 2) {
        alert("Error: Position is unavailable!");
    }
}


function currentPositionError(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

function checker() {

}