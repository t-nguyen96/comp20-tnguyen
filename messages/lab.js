// Your JavaScript goes here...

function parse() {
    var request = new XMLHttpRequest();
    //var url = "data.json";
    var url = "https://messagehub.herokuapp.com/messages.json";
    request.open("GET", url, true);
    message_box = document.getElementById("messages");

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            raw_mess = request.responseText;
            message = JSON.parse(raw_mess);
            message_box.innerHTML = "<p>" + message[0].content + " - " 
                                    + message[0].username + "</p>";
            message_box.innerHTML = "<p>" + message[1].content + " - " 
                                    + message[1].username + "</p>" + message_box.innerHTML;
        }
    }
    request.send(null);
}