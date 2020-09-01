const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const socket = io();

// Get user name and room
const {username, room} = Qs.parse(location.search,{
  ignoreQueryPrefix: true
});

console.log(username, room);

// Join chatroom
socket.emit('joinRoom', {username, room});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Put info on page
socket.on('roomUsers', ({room, users}) => {
  console.log(room, users);
  outputRoomName(room);
  outputUsers(users);
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// outputMessage

outputMessage = function(message){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

outputRoomName = function(room){
  roomName.innerText = room;
}

outputUsers = function(users){
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
