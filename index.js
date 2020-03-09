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
var onlineusers = [];

var chatlog = [];
var isCookie = false;

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
  var username;
  var usercolor;
  var nameIsTaken = false;

  // New user socket init

  socket.on('cookie', (data)=>{
    console.log('cookie reached')

    for(var i = 0; i < userlist.length ; i++){
      if (data.username === userlist[i].name){
        nameIsTaken = true;
        socket.emit('taken name');
      }
    }
    if(nameIsTaken === false){
      username = data.username;
      usercolor = data.color;
      var user = { name: username, color: usercolor };
      userlist.push(user);
      socket.emit('init user', {
        name: username,
        color: usercolor
      });
      socket.emit('chat log', chatlog);
      io.sockets.emit('user list', userlist);
    

    }
  });

  socket.on('no cookie', ()=>{
    console.log('no cookie reached')
    username = UsernameGenerator.generateUsername();
    usercolor = getRandomColor();
    var user = { name: username, color: usercolor };
    userlist.push(user);
    socket.emit('init user', {
      name: username,
      color: usercolor
    });
    socket.emit('chat log', chatlog);
    io.sockets.emit('user list', userlist);
  

  });

  console.log(username)
 
  // Handle chat event
  socket.on('chat', (data) => {
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
      }else{
        socket.emit('taken name');
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
