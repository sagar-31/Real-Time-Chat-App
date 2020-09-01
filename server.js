const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users') ;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set Static folder
app.use(express.static(path.join(__dirname, 'Public')));

const botName = 'GoChat Bot';

// Run when client connects
io.on('connection', socket => {

  // Join room
  socket.on('joinRoom', ({username, room}) => {
    // Welcome current user
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage(botName, `Welcome to GoChat ${user.username} :)`));

    // Broadcast when a user enters
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the room.`));

    // send user and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // get current user
  // console.log(user);

  // Listen for chat message
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if(user){
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the room.`));

      // send user and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
