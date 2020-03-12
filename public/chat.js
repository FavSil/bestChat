// Make connection
var socket = io.connect('http://localhost:4000');

// Query DOM
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    userlist = document.getElementById('user-list'),
    feedback = document.getElementById('feedback');
username = document.getElementById('username');


var currentuser;
var usercolor;
var roomlist = [];

//https://www.w3schools.com/js/js_cookies.asp
//following two functions adapted from w3
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cookieName, cookieValue) {
    document.cookie = cookieName + " = " + cookieValue + ";";
}
//End functions adapted from w3

function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
}
function getOutput() {

    shouldScroll = output.scrollTop + output.clientHeight === output.scrollHeight;

    if (!shouldScroll) {
        scrollToBottom();
    }
}
function isHex(string) {
    var parsedString = parseInt(string, 16);
    return (parsedString.toString(16) === string.toLowerCase())
}

function updateScroll(element) {
    
    element.scrollTop = element.scrollHeight;
  }

// Emit events
btn.addEventListener('click', function () {


    if (message.value.slice(0, 10) === '/nickcolor') {
        var newcolor = message.value.slice(11, 17);
        console.log(newcolor)
        if (isHex(newcolor)) {
            console.log(newcolor);
            socket.emit('colorchange', currentuser, newcolor);
            setCookie("usercolor", newcolor);
        } else {
            alert("invalid hex value, please put in format of RRGGBB")
        }

    } else if (message.value.slice(0, 5) === '/nick') {

        var newnick = message.value.slice(5, message.value.length);
        var taken = false;
        for (var i = 0; i < roomlist.length; i++) {
            if (roomlist[i].name === newnick) {
                taken = true;
                alert("nickname already taken")
            }
        }
        if (taken !== true) {
            console.log(newnick);
            socket.emit('nickchange', newnick);
            setCookie("username", newnick);
        }

    } else if (message.value === "") {
        return;

    } else {
        socket.emit('chat', {
            message: message.value,
            handle: currentuser,
            color: usercolor,

        });
    }
    message.value = "";
});

socket.on('connect', () => {
    if (getCookie("username") !== "undefined" && typeof getCookie("username") !== "undefined" && getCookie("username") !== "") {
        console.log(getCookie("username"))
        socket.emit('cookie', {
            username: getCookie("username"),
            color: getCookie("usercolor")
        })
    } else {
        socket.emit('no cookie');
    }
});

socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

// Listen for events

socket.on('taken name', () => {
    alert("name is taken, a random one has been asigned.")
})

socket.on('chat log', (data) => {
    console.log('data')

    output.innerHTML = "";
    for (var i = 0; i < data.length; i++) {
        output.innerHTML += '<p>' + data[i].time + '<strong style="color:' + data[i].color + ' ">' + data[i].handle + ': </strong>' + data[i].message + '</p>';
        updateScroll(output);
    }
 
});

socket.on('chat', function (data) {
    console.log('chat -log')
    if (data.handle === currentuser) {

        output.innerHTML += '<p>' + data.time + '<strong style="color:' + data.color + ' ">' + data.handle + ': </strong> <b>' + data.message + '</b></p>';
    } else {
        output.innerHTML += '<p>' + data.time + '<strong style="color:' + data.color + ' ">' + data.handle + ': </strong>' + data.message + '</p>';

    }
    updateScroll(output);
});


socket.on('user list', (data) => {
    console.log(data)
    userlist.innerHTML = "";
    //roomlist = data;
    for (var i = 0; i < data.length; i++) {
        userlist.innerHTML += '<p><strong style="color:' + data[i].color + ' ">' + data[i].name + '</p>';
    }
});

socket.on('init user', (data) => {

    usercolor = data.color;
    currentuser = data.name;
    username.innerHTML = '<p><strong style="color:' + data.color + ' ">' + data.name + ' </strong></p>';
    setCookie("username", data.name);
    setCookie("usercolor", data.color);

});
