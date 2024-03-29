function map_init() 
{
        var lat;
        var lng;
        navigator.geolocation.getCurrentPosition(function(pos) {
                coords = pos.coords;
                lat = coords.latitude;
                lng = coords.longitude;
                data_init(lat, lng);
        });     
}
function data_init(lat, lng) 
{
        var request = new XMLHttpRequest();
        var url = "https://pure-meadow-76257.herokuapp.com/sendLocation";
        var params = "login=GABRIEL_BECKER&lat=" + lat + "&lng=" + lng;
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function() {
                if (request.readyState == 4) {
                        rawinfo = request.responseText;
                        mapinfo = JSON.parse(rawinfo);
                        google_map_init(lat, lng, mapinfo)
                }
        };
        request.send(params);
}
function google_map_init(lat, lng, mapdata) 
{            
        latlng = new google.maps.LatLng(lat, lng);
        myOptions = { center: latlng , zoom: 15};
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        ppl_init(mapdata, map, lat, lng);
        min_landmark = landmark_init(mapdata, map, lat, lng);

        var myinfowindow = new google.maps.InfoWindow();
        var content = get_myContent("GABRIEL_BECKER", min_landmark);
        var min_latlng = new google.maps.LatLng(min_landmark.lat, min_landmark.lng);
        create_line(map, latlng, min_latlng);
        var mylocmark = marker_init(map, myinfowindow, content, latlng, "you.png");
        google.maps.event.addListener(mylocmark, 'click', function() {
                myinfowindow.close;
        });
}
function ppl_init(mapdata, map, mylat, mylng) 
{
        var curr_person = mapdata.people;
        var infowindow = new google.maps.InfoWindow();
                for (i = 0 ; i < mapdata.people.length ; i++) {
                        var latlng = new google.maps.LatLng(curr_person[i].lat, curr_person[i].lng);
                        var content = get_pplContent(mylat, mylng, latlng, curr_person[i].login);
                        var pplmark = marker_init(map, infowindow, content, latlng, "personicon.png");
                        google.maps.event.addListener(pplmark, 'click', function() {
                                infowindow.close;
                        });
                }
            
}
function landmark_init(mapdata, map, mylat, mylng) 
{
        var curr_landmark = mapdata.landmarks;
        var infowindow = new google.maps.InfoWindow();
        var min_landmark = new Object();
        min_landmark.dist = haversine_calc(mylat, curr_landmark[0].geometry.coordinates[1], 
                                          mylng, curr_landmark[0].geometry.coordinates[0]);
        min_landmark.name = curr_landmark[0].properties.Location_Name;
        min_landmark.lat = curr_landmark[0].geometry.coordinates[1];
        min_landmark.lng = curr_landmark[0].geometry.coordinates[0];

        for (i = 0 ; i < mapdata.landmarks.length ; i++) {
                var lng = curr_landmark[i].geometry.coordinates[0];
                var lat = curr_landmark[i].geometry.coordinates[1];
                var dist = haversine_calc(mylat, lat, mylng, lng);
                if (dist < 1) {
                        var latlng = new google.maps.LatLng(lat, lng)
                        var content = get_landmarkContent(curr_landmark[i].properties.Location_Name,
                                                                curr_landmark[i].properties.Details);
                        var landmark = marker_init(map, infowindow, content, latlng, "poi.png");
                        google.maps.event.addListener(landmark, 'click', function() {
                                infowindow.close;
                        });
                }
                if (dist < min_landmark.dist) {
                    min_landmark.dist = dist;
                    min_landmark.name = curr_landmark[i].properties.Location_Name;
                }
        }
        return min_landmark;
}
function marker_init(map, infowindow, content, latlng, icon) 
{
        var marker = new google.maps.Marker( {
                position: latlng,
                map: map,
                title: content,
                icon: icon
        }); 
        google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(this.title);
                infowindow.open(map, this);   
        });
        return marker;
}
function haversine_calc(lat1, lat2, lng1, lng2) 
{
        Number.prototype.toRad = function() {
                return this * Math.PI / 180;
        }
        var R = 6371; // km 
        var x1 = lat2-lat1;
        var dLat = x1.toRad();  
        var x2 = lng2-lng1;
        var dLon = x2.toRad();  
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);  
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; 
        d = d * 0.621371; // converting from km to miles
        return d.toFixed(2);
}
function get_pplContent(mylat, mylng, pos, name) 
{
        var dist = haversine_calc(mylat, pos.lat(), mylng, pos.lng());
        var content_str = '<h2 id="title">' + name + '</h2>' 
                        + '<p>Distance from you: ' + dist + ' mi</p>';
        return content_str;
}
function get_landmarkContent(name, info) 
{
        var content_str ='<h2 id="landmarktitle">' + name + '</h2>' 
                        + '<p>' + info + '</p>';
        return content_str;
}
function get_myContent(name, min_landmark) 
{
        var content_str ='<h2 id="title">' + name + '</h2>' 
                        + '<p>Closest landmark: ' + min_landmark.name + '</p>'
                        + '<p>Distance from you: ' + min_landmark.dist + ' mi</p>';

        return content_str;
}
function create_line(map, myPos, minPos) 
{
        var path_coords = [
                        {lat: myPos.lat(), lng: myPos.lng()},
                        {lat: minPos.lat(), lng: minPos.lng()}
                                                              ];
        var landmark_line = new google.maps.Polyline({
                path: path_coords,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
        });
        landmark_line.setMap(map);
}