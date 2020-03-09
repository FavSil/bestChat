var express = require('express');
var socket = require('socket.io');
var UsernameGenerator = require('username-generator');

// App setup
var app = express();
var server = app.listen(4000, function() {
  console.log('listening for requests on port 4000,');
});

// Variable Setup
var userlist = [];
var usercolor;
var chatlog = [];

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);

// Functions
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}
function currentTime() {
    var displayTime;
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    if(minute < 10){minute = "0" + minute;}
    displayTime = hour + ":" + minute + "   ";
    return displayTime;
}

// Socket Init

io.on('connection', socket => {
  // New user socket init
  var username = UsernameGenerator.generateUsername();
  var usercolor = getRandomColor();

  var user = { name: username, color: usercolor };

  userlist.push(user);

  socket.emit('init user', {
    name: username,
    color: usercolor
  });
  io.sockets.emit('chat log', chatlog);
  io.sockets.emit('user list', userlist);

  // Handle chat event
  socket.on('chat', data => {
    data.time = currentTime();
    chatlog.push(data);
    io.sockets.emit('chat', data);
  });

  socket.on('nickchange', (data) => {
    //go through list and check if the nickname is in the list.
    for (var i = 0; i < userlist.length; i++) {
      if (data !== userlist[i].name) {
        //go through list again and change the nickname.
        //could be simplified if marking index of username in first passthrough
        for (var i = 0; i < userlist.length; i++) {
          if (userlist[i].name === username) {
            user.color = userlist[i].color;
            userlist.splice(i, 1);
            user.name = data;

            userlist.push(user);
            socket.emit('init user', user);
            io.sockets.emit('user list', userlist);
          }
        }
      }
    }
  });

  socket.on('colorchange', (userdata, newcolor) => {
    for (var i = 0; i < userlist.length; i++){
        if(userdata === userlist[i].name){
            userlist[i].color = newcolor;
            usercolor = newcolor;
            socket.emit('init user', user);
            io.sockets.emit('user list', userlist);
        }

    }

  });

  socket.on('disconnect', () => {
    for (var i = 0; i < userlist.length; i++) {
      if (userlist[i].name === username) {
        userlist.splice(i, 1);
        io.sockets.emit('user list', userlist);
      }
    }
  });
});
