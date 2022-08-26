const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const { generateMessage } = require('./utils/message.js');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
app.use(express.static(publicPath));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000'
  }
});
const users = new Users();

app.use(function(req, res, next) {
  const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  return next();
})

app.get('/api/users', (req, res, next) => {
  console.log(req.query)
  return res.status(200).json('user');
});

io.on('connection', (socket) => {

  socket.on('leave', (params) => {
    socket.leave(params.room);
  });

  socket.on('join', (params, callback) => {

    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Bad request');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', params.room, 'Welcome to the chat app.'));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', params.room, `${params.name} has joined.`));

    callback();
  });

  socket.on('createMessage', (message, callback) => {
    const user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      let tempObj = generateMessage(user.name, user.room, message.text);
      io.to(user.room).emit('newMessage', tempObj);
      callback({
        data: tempObj
      });
    }
    callback();
  });

  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', user.room, `${user.name} has left.`));
    }
  });

});

server.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

