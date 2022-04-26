var watchID, geoLoc, target, travelMode, directionsService, directionRenderer;
var flag = false;
var notAtTrail = true
var centered = false;
var completeButtonFlag = false;
var getRouteButtonFlag = false;
var isopen = false;
var gMarkers = []
var markers = {};
var polyline = null;

var NYPStart = {
    // nyp
    // latitude: 1.379155,
    // longitude: 103.849828
    latitude: 1.427737492302623,
    longitude: 103.83392954430072
};

var chinatownstart = {

    latitude: 1.2826330692039218,
    longitude: 103.84501595442900
};

var homestart = {
    
    latitude: 1.427737492302623,
    longitude: 103.83392954430072
};

var landmarkIndex = 0
var trail = ""
var localStorage = window.localStorage
var distance = 0

var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
trail = queryString;
localStorage.setItem('Trail', trail);
if (trail == 'nypTrail') {
    localStorage.setItem('Trail', 'nyp');
    if (localStorage.getItem('nyp Progress')) { // Progress exists
        var NYPPROGRESS = localStorage.getItem('nyp Progress');
        NYPPROGRESS = JSON.parse(NYPPROGRESS);

    } else {
        var NYPPROGRESS = [0, 0, 0, 0, 0, 0, 0, 0]
        var progress = JSON.stringify(NYPPROGRESS);
        console.log("PROGRESSS", progress);
        localStorage.setItem('nyp Progress', progress);
    }
} else if (trail == 'ctTrail') {
    localStorage.setItem('Trail', 'Chinatown')
    if (localStorage.getItem('Chinatown Progress')) { // Progress exists
        var CTPROGRESS = localStorage.getItem('Chinatown Progress');
        CTPROGRESS = JSON.parse(CTPROGRESS);

    } else {
        var CTPROGRESS = [0, 0, 0, 0, 0, 0, 0, 0]
        var progress = JSON.stringify(CTPROGRESS);
        console.log("PROGRESSS", progress);
        localStorage.setItem('Chinatown Progress', progress);
    }
} else if (trail == 'homeTrail') {
    localStorage.setItem('Trail', 'home')
    if (localStorage.getItem('home Progress')) { // Progress exists
        var HomePROGRESS = localStorage.getItem('home Progress');
        HomePROGRESS = JSON.parse(HomePROGRESS);

    } else {
        var HomePROGRESS = [0, 0, 0, 0, 0, 0, 0, 0]
        var progress = JSON.stringify(HomePROGRESS);
        console.log("PROGRESSS", progress);
        localStorage.setItem('home Progress', progress);
    }
}
//
function start() {
    if (navigator.geolocation) {
        geoLoc = navigator.geolocation
        // Get current positon 
        var options = {
            enableHighAccuracy: true,
            maximumAge: 0
        };


        geoLoc.getCurrentPosition(startingTrail, currentPositionError, options)

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

function getDistance(mk1, mk2) {
    var R = 6378137; // Radius of the Earth in miles
    var rlat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians
    var rlat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radians
    var difflat = rlat2 - rlat1; // Radian difference (latitudes)
    var difflon = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)
    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
    return d;
}

function checkDistanceFromTrail(origin, traillocation) {
    distance = getDistance(origin, traillocation)
    // distance = 100;
    if (distance > 1600) {
        localStorage.setItem("status", "toTrail");
        var myModal = new bootstrap.Modal(document.getElementById('dialog'))
        // console.log(myModal, "MODAL");
        myModal.show();
        // console.log($('#ok'));
        $('#home').on('click', function () {
            window.location.href = 'overview.html'
        })
        $('#navigate').on('click', function () {
            $('#option').css("display", 'block');
            $('#modaltitle').text('Navigating to trail');
            $('#body').text('Please select mode of transport to begin navigating');
            $('#home').css("display", 'none');
        })
        $('#travelmode').change(function () {
            travelMode = $('#travelmode').val();
            if (travelMode) {
                localStorage.setItem('travelMode', travelMode);
                getEstDuration(origin, traillocation, travelMode);
                if (travelMode == 'TRANSIT') {
                    $('#transitOptions').css('display', 'inline-block');

                    $('input[type="radio"]').click(function () {
                        var transitOptions = {
                            "modes": [document.querySelector('input[type="radio"]:checked').value]
                        };
                        getEstDuration(origin, traillocation, travelMode, transitOptions)
                    })

                    $('#navigate').on('click', function () {
                        if (document.querySelector('input[type="radio"]:checked')) {
                            var transitOptions = {
                                "modes": [document.querySelector('input[type="radio"]:checked').value]
                            };
                            localStorage.setItem('transitOptions', JSON.stringify(transitOptions));
                            // console.log(transitOptions);
                        }
                        myModal.hide();
                        localStorage.setItem('status', 'Navigating');
                        displayRoute(origin, traillocation, travelMode, transitOptions);
                    })
                } else {
                    $('#transitOptions').css('display', 'none');
                    $('#navigate').on('click', function () {
                        myModal.hide();
                        displayRoute(origin, traillocation, travelMode);
                    })
                }
            } else {
                var estTime = document.getElementById('estTime');
                estTime.innerHTML = "";
            }
        })
    }
    // If at the trail already
    else {
        var status = localStorage.getItem("status");
        if (status && status == "toTrail") {
            localStorage.setItem('status', 'atTrail');
            location.reload();
        }
    }
}

async function getEstDuration(latlng, destination, travelMode, transitOptions = {}) {
    // var duration;
    let a = await directionsService.route({
        origin: latlng,
        destination: destination,
        travelMode: google.maps.TravelMode[travelMode],
        transitOptions: transitOptions,
    }).then((response) => {
        const route = response.routes[0];
        var leg = route.legs[0]
        duration = leg.duration.text;
        console.log(duration, "DURATION");
        var estTime = document.getElementById('estTime');
        estTime.innerHTML = "Estimated Time: " + duration;
    })
}

function click(open,leg) {
    if (open == false) {
        $('#instructions').css('overflow', 'scroll');
        $('#instructions').css('height', '15%');
        var table = document.createElement('table')
        var count = 0;
        leg['steps'].forEach(step => {
            var row = table.insertRow();
            var cell = row.insertCell()
            
            var text = step.instructions + " " + step.distance.text + " " + step.duration.text
            if(count==0){
                text = "<div style='margin:auto'>" +  step.instructions + " " + step.distance.text + " " + step.duration.text +'</div>'
                cell.style="width:100%;text-align: center;justify-content: center;align-items: center;display:inline-flex";
                var uparrow = "<div><i class='fas fa-angle-double-down'></i><div>"
                text +=uparrow;
                count++;
            }
            cell.innerHTML = text;
        });
        var height = $('#instructions').height();
        console.log(height, 'h')
        table.style = 'height:' + height + 'px';
        $('#instructions').html(table);
        isopen = true;
    }
    else{
        $('#instructions').css('height', '2.5%');
        document.getElementById("instructions").innerHTML = instructions;
        isopen= false;
    }
}


function displayRoute(latlng, destination, travelMode, transitOptions = {}) {
    removeMarkers();
    directionRenderer.setOptions({suppressMarkers:true});
    directionsService.route({
        origin: latlng,
        destination: destination,
        travelMode: google.maps.TravelMode[travelMode],
        transitOptions: transitOptions,
    }).then((response) => {
        directionRenderer.setMap(window.map);
        directionRenderer.setDirections(response);

        google.maps.Polyline.prototype.GetPointsAtDistance = function(metres) {
            var next = metres;
            var points = [];
            // some awkward special cases
            if (metres <= 0) return points;
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

        const route = response.routes[0];
        var leg = route.legs[0]
        console.log(leg, "LEG");

        // RED MARKERS

        // var directionsData = response.routes[0].legs[0];
  
        // for (var i = 0; i < directionsData.steps.length; i++) {
        //   console.log(directionsData.steps[i].start_point.lat());
        //   console.log(directionsData.steps[i].start_point.lng());
        
        // var wayPoint = new google.maps.Marker ({
        //         position: {
        //             lat: directionsData.steps[i].start_point.lat(),
        //             lng: directionsData.steps[i].start_point.lng()
        //         },
        //         //draggable: true,
        //         map: map,
        //     });  
        //     gMarkers.push(wayPoint)
        // }

        instructions = "<h1>" + leg["steps"][0].instructions + " " + leg["steps"][0].distance.text + "  " + leg["steps"][0].duration.text + "</h1>"
        var uparrow = "<div><i class='fas fa-angle-double-up'></i><div>"
        instructions += uparrow;
        $("#instructions").css('display', 'inline-flex')
        document.getElementById("instructions").innerHTML = instructions
        $('#instructions').on('click', function () {
            click(isopen,leg);
        });

        var marker = {
            labelOrigin: new google.maps.Point(11, -12),
            url: "https://i.ibb.co/MGJr4Mq/image-1.png",
            size: new google.maps.Size(34, 65),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11, 40),
        }
        var trail = localStorage.getItem('Trail');

        gMarker = makeStartMarker(leg.start_location, leg.end_location)
        
        endMarker = makeMarker(leg.end_location,marker,trail);
        
        console.log(latlng.lat);
        console.log(latlng.lng);

        var startPointlat = parseFloat(latlng.lat);
        var startPointlng = parseFloat(latlng.lng);
        var endPointlat = parseFloat(destination.lat);
        var endPointlng = parseFloat(destination.lng);

        //https://stackoverflow.com/questions/9594598/add-markers-along-a-route
        
        console.log(latlng.lat);
        console.log(latlng.lng);
        console.log(destination.lat);   
        console.log(destination.lng);   

        var startLatlng = new google.maps.LatLng(leg.start_location);
        var endLatLng = new google.maps.LatLng(leg.end_location);

        polyline = new google.maps.Polyline({
            path: [],
            strokeColor: '#FF0000',
            strokeWeight: 0
          });

        polyline.setPath([]);
        var bounds = new google.maps.LatLngBounds();
        startLocation = new Object();
        endLocation = new Object();

        // For each route, display summary information.
        var path = response.routes[0].overview_path;
        var legs = response.routes[0].legs;
        
        for (i = 0; i < legs.length; i++) {
            if (i == 0) {
              startLocation.latlng = legs[i].start_location;
              startLocation.address = legs[i].start_address;
              // marker = google.maps.Marker({map:map,position: startLocation.latlng});
              marker = createMarker(legs[i].start_location, "start", legs[i].start_address);
            }
            endLocation.latlng = legs[i].end_location;
            endLocation.address = legs[i].end_address;
            var steps = legs[i].steps;
            for (j = 0; j < steps.length; j++) {
              var nextSegment = steps[j].path;
              for (k = 0; k < nextSegment.length; k++) {
                polyline.getPath().push(nextSegment[k]);
                bounds.extend(nextSegment[k]);
              }
            }
          }
          polyline.setMap(map);
          for (var i = 0; i < gMarkers.length; i++) {
            gMarkers[i].setMap(null);
          }
          for (var i = 0; i < gMarkers.length; i++) {
            gMarkers[i].setMap(null);
          }
          
          var points = polyline.GetPointsAtDistance(5);
        //   for (var i = 0; i < points.length; i++) {
        //     var marker = new google.maps.Marker({
        //       map: map,
        //       position: points[i],
        //       title: i + 1 + " mile"
        //     });
        //     console.log(marker.getPosition().lat());
        //     console.log(marker.getPosition().lng());
        // }
    })
    // google.maps.event.trigger(map, 'resize');
    map.setCenter(origin)
    // map.setZoom(20);
}

function removeMarkers() {
    for (i = 0; i < gMarkers.length; i++) {
        gMarkers[i].setMap(null);
    }
}

function createMarker(latlng, label, html) {
    // alert("createMarker("+latlng+","+label+","+html+","+color+")");
    var contentString = '<b>' + label + '</b><br>' + html;
    var marker = new google.maps.Marker({
      position: latlng,
      // draggable: true, 
      map: map,
      title: label,
      zIndex: Math.round(latlng.lat() * -100000) << 5
    });
    marker.myname = label;
    gMarkers.push(marker);

    return marker;
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
                //path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 7,
                strokeOpacity: 1
            }
        }]
    })

    return line
}

//init Map based on trail
function startingTrail(position) {
    if (localStorage.getItem('Trail')) {
        trail = localStorage.getItem('Trail');
    } else {
        window.location.href = 'overview.html';
    }
    console.log(trail);
    var icons = {
        marker: {
            labelOrigin: new google.maps.Point(11, -12),
            url: "https://i.ibb.co/MGJr4Mq/image-1.png",
            size: new google.maps.Size(34, 65),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11, 40),
        },
        Completedmarker: {
            labelOrigin: new google.maps.Point(11, -12),
            url: "https://maps.google.com/mapfiles/kml/paddle/grn-circle.png",
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11, 40),
        }
    };

    if (trail == 'Chinatown') {
        console.log('CHINATOWN');
        var startlat = chinatownstart["latitude"]
        var startlong = chinatownstart["longitude"]
        trail = 'chinatown';
    } else if (trail == 'nyp') {
        var startlat = NYPStart["latitude"]
        var startlong = NYPStart["longitude"]
        trail = "nyp";
    } else if (trail == 'home') {
        var startlat = homestart["latitude"]
        var startlong = homestart["longitude"]
        trail = "home";
    } else {
        window.location.href = 'overview.html'
    }
    var origin = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    // console.log(trails[trail])
    checkDistanceFromTrail(origin, trails[trail]['location']);
    localStorage.setItem('trailLocation', JSON.stringify(trails[trail]['location']));
    console.log("DISTANCE CHECK")
    window.map = new google.maps.Map(document.getElementById("map"), { //init Map
        zoom: 19,
        center: {
            lat: startlat,
            lng: startlong
        },
        zoomControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        disableDefaultUI: true,
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
    map.addListener('drag', function () {
        markers['user'].setAnimation(null);
    })
    map.addListener('click', function () {
        markers['user'].setAnimation(null);
    })
    var keys = Object.keys(trails);
    console.log(trails[trail], "TRAILS")
    var landmarks = trails[trail]['landmarks']
    var boundary = new google.maps.LatLngBounds();
    console.log(landmarks, 'LANDMARKS')
    for (i = 0; i < landmarks.length; i++) {
        var htmlObject = $(landmarks[i].contentHTML);
        boundary.extend(landmarks[i].location);
        if (NYPPROGRESS) {
            if (NYPPROGRESS[i] == 1 && trail == 'nyp') {
                marker = makeCompletedMarker(landmarks[i].location, icons.Completedmarker, landmarks[i].name);
            } else {
                marker = makeMarker(landmarks[i].location, icons.marker, landmarks[i].name) //position, icon, title
                distance = getDistance(origin, landmarks[i].location);
                console.log(origin, distance, "DISTANCE");
                htmlObject.find('h5').text(Math.round(distance) + 'm Away');
                console.log(htmlObject.html(), "HTML");
                marker.content = htmlObject.html();

                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, "click", (function (marker, i) {
                        return function () {
                            closelastopen(infowindow);
                            infowindow.setContent(marker.content);
                            infowindow.open({
                                anchor: marker,
                                map,
                                shouldFocus: false,
                            });
                            lastopen = infowindow;
                            var location = position.longitude
                        }
                    })
                    (marker, i));
            }
        } else if (CTPROGRESS) {
            if (CTPROGRESS[i] == 1 && trail == 'chinatown') {
                marker = makeCompletedMarker(landmarks[i].location, icons.Completedmarker, landmarks[i].name);
            } else {
                marker = makeMarker(landmarks[i].location, icons.marker, landmarks[i].name) //position, icon, title
                distance = getDistance(origin, landmarks[i].location);
                console.log(origin, distance, "DISTANCE");
                htmlObject.find('h5').text(Math.round(distance) + 'm Away');
                console.log(htmlObject.html(), "HTML");
                marker.content = htmlObject.html();

                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, "click", (function (marker, i) {
                        return function () {
                            closelastopen(infowindow);
                            infowindow.setContent(marker.content);
                            infowindow.open({
                                anchor: marker,
                                map,
                                shouldFocus: false,
                            });
                            lastopen = infowindow;
                            var location = position.longitude
                        }
                    })
                    (marker, i));
            }
        } else if (HomePROGRESS) {
            if (HomePROGRESS[i] == 1 && trail == 'home') {
                marker = makeCompletedMarker(landmarks[i].location, icons.Completedmarker, landmarks[i].name);
            } else {
                marker = makeMarker(landmarks[i].location, icons.marker, landmarks[i].name) //position, icon, title
                distance = getDistance(origin, landmarks[i].location);
                console.log(origin, distance, "DISTANCE");
                htmlObject.find('h5').text(Math.round(distance) + 'm Away');
                console.log(htmlObject.html(), "HTML");
                marker.content = htmlObject.html();

                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, "click", (function (marker, i) {
                        return function () {
                            closelastopen(infowindow);
                            infowindow.setContent(marker.content);
                            infowindow.open({
                                anchor: marker,
                                map,
                                shouldFocus: false,
                            });
                            lastopen = infowindow;
                            var location = position.longitude
                        }
                    })
                    (marker, i));
            }
        }  
        else {
            marker = makeMarker(landmarks[i].location, icons.marker, landmarks[i].name) //position, icon, title
            distance = getDistance(origin, landmarks[i].location);
            console.log(origin, distance, "DISTANCE");
            htmlObject.find('h5').text(Math.round(distance) + 'm Away');
            console.log(htmlObject.html(), "HTML");
            marker.content = htmlObject.html();

            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, "click", (function (marker, i) {
                    return function () {
                        closelastopen(infowindow);
                        infowindow.setContent(marker.content);
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        });
                        lastopen = infowindow;
                        var location = position.longitude
                    }
                })
                (marker, i));
        }
        console.log(marker);
        console.log(typeof (marker.content));
        // popup = new Popup(landmarks[i].location,landmarks[i].content)
        // marker.addListener('click',()=>{
        //     popup.setMap(map);
        // });


        gMarkers.push(marker);
    }
    google.maps.event.addListener(map, "click", function (event) {
        infowindow.close();
    });
    window.map.fitBounds(boundary)



}

function closelastopen(iw) {
    iw.close();
}

function getMap() {

    console.log(map);
    return map;
}


function makeCompletedMarker(position, icon, title) {
    marker = new google.maps.Marker({

        position: position,
        label: {
            color: 'black',
            fontWeight: 'bold',
            text: title,
            fontSize: '25px',
        },
        map: map,
        icon: icon,
        title: title,
        opacity: 0.5,
    });

    return marker
}

//get current location
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
            text: title,
            fontSize: '25px',
        },
        map: map,
        icon: icon,
        title: title
    });

    return marker
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
    landmarks = trail.landmarks
    var keys = Object.keys(landmarks);
    for (let i = 0; i < keys.length; i++) {

        marker = makeIncrementalMarker(landmarks[keys[i]], i) //position, i
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    const infowindow = new google.maps.InfoWindow({
                        content: landmarks[i].contentHTML
                    });

                    infowindow.open({
                        anchor: marker,
                        map,
                        shouldFocus: false,
                    });
                }
            })
            (marker, i));
        gMarkers.push(marker);
    }

    window.map.setCenter(trail.location)
    smoothZoom(window.map, 18, window.map.getZoom())

}

function currentPositionSuccess(position) {
    // Icons
    var icons = {
        marker: {
            labelOrigin: new google.maps.Point(11, -12),
            url: "https://i.ibb.co/MGJr4Mq/image-1.png",
            size: new google.maps.Size(34, 65),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(11, 40),
        }
    };

    window.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: {
            lat: 1.354887375010911,
            lng: 103.8252658350733
        },
        zoomControl: false,
        mapTypeControl: true,
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

    // Resize stuff...
    google.maps.event.addDomListener(window, "resize", function () {
        var center = map.getCenter();
        google.maps.event.trigger(window.map, "resize");
        window.map.setCenter(center);
    })

    // // Make option markers with action
    // var optionDiv1 = createOptionDiv('China Town','chinaTownOption')
    // var optionDiv2 = createOptionDiv('Kampung Glam',"kampungGlamOption")
    // var optionDiv3  = createOptionDiv('Little India',"littleIndiaOption")
    // var optionDiv4 = createOptionDiv('Peranakan',"peranakanOption") 
    // var optionDiv5 = createOptionDiv('NYP','nypOption')
    //var sep = new separator();

    // var ddDivOptions = {
    //     items: [optionDiv1, optionDiv2,optionDiv3,optionDiv4,optionDiv5],
    //     id: "myddOptsDiv"        		
    // }

    // var dropDownDiv = new dropDownOptionsDiv(ddDivOptions);   
    // var dropDownOptions = {
    //     gmap: window.map,
    //     name: 'Choose Trail',
    //     id: 'ddControl',
    //     position: google.maps.ControlPosition.TOP,
    //     dropDown: dropDownDiv ,
    //     style: "font-size:370%;width:180px",
    // }
    // var dropDown1 = new dropDownControl(dropDownOptions); 

    // Set start button into the map also
    // var startBtn = document.getElementById("submit")
    var recetnerBtn = document.getElementById("recenter");
    // window.map.controls[google.maps.ControlPosition.TOP].push(dropDown1);
    // window.map.controls[google.maps.ControlPosition.TOP].push(startBtn);
    window.map.controls[google.maps.ControlPosition.TOP].push(recetnerBtn);

    var boundary = new google.maps.LatLngBounds();
    // Make Trail markers
    removeMarkers()

    var keys = Object.keys(trails);
    console.log(trails, "TRAILS")
    for (let i = 0; i < keys.length; i++) {
        boundary.extend(trails[keys[i]].location)
        marker = makeMarker(trails[keys[i]].location, icons.marker, trails[keys[i]].name) //position, icon, title
        google.maps.event.addListener(marker, 'click', function () {
            makeLandmarkMarkers(trails[keys[i]])
            dropDown = document.getElementById('Choose Trail')
            dropDown.innerHTML = (trails[keys[i]].name)
            trail = trails[keys[i]].name
            cancelBtn = makecancelButton()
            window.map.controls[google.maps.ControlPosition.TOP].push(cancelBtn);
            localStorage.setItem('trail', trails[keys[i]].name)
        });
        gMarkers.push(marker);

    }
    window.map.fitBounds(boundary)
}






//draw current location of user

function makeuserlocation(position, icon, title) {
    var id = 'user';
    var exist = markers[id];
    if (!exist) {
        marker = new google.maps.Marker({

            position: position,
            label: {
                color: 'black',
                fontWeight: 'bold',
                text: title,
                fontSize: '20px',
            },
            map: map,
            icon: icon,
            title: title,
            id: id,
            animation: google.maps.Animation.BOUNCE,
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
                fontSize: '20px',
            },
            map: map,
            icon: icon,
            title: title,
            id: 'user',
            animation: google.maps.Animation.BOUNCE,
        });
        markers[id] = marker;
    }
    return marker
}

function stopMarker(marker) {
    marker.setAnimation(null);
}

//when position changes
function success(position) {
    origin = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    // recenterLogic(origin)
    console.log(origin);
    const map = window.map;
    var icon = "assets/img/userLocation.png";
    makeuserlocation(origin, icon, "You Are Here");
    directionsService = new google.maps.DirectionsService();
    directionRenderer = new google.maps.DirectionsRenderer({
        preserveViewport: true
    });
    var status = localStorage.getItem('status');
    var location = JSON.parse(localStorage.getItem('trailLocation'));
    var travelMode = localStorage.getItem('travelMode');
    if (localStorage.getItem('transitOptions') && localStorage.getItem('transitOptions') != undefined) {
        var transitOptions = JSON.parse(localStorage.getItem('transitOptions'));
    }
    console.log(location, "LOCO")
    console.log(travelMode);
    console.log(transitOptions);
    
    if (status == 'Navigating') {
        if (location && travelMode && transitOptions) {
            displayRoute(origin, location, travelMode, transitOptions);
            console.log(travelMode);
            console.log(transitOptions);
        } else if (location && travelMode) {
            displayRoute(origin, location, travelMode);
            console.log(travelMode);
        }
    }
    directionRenderer.setMap(map);
}




function errorHandler(err) {
    if (err.code == 1) {
        alert("Error: Access is denied!");

        // TODO: getLocationUpdate() to ask again or send back to home 
    } else if (err.code == 2) {
        alert("Error: Position is unavailable!");
    }
}

function currentPositionError(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}














