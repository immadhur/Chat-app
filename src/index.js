const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const user = require('../utils/users');
const { generateMessage } = require('../utils/messages');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);
publicDir = path.join(__dirname, '../public')
app.use(express.static(publicDir));

io.on('connection', (socket) => {
    console.log('New Connection!');
    socket.emit('welcome');
    socket.broadcast.emit('message', 'A new user has joined!');
    socket.on('join', ({ username, room }, callback) => {
        const isUserAdded = user.addUser(
            {
                id: socket.id,
                username,
                room
            });
        if (isUserAdded) {
            socket.join(room);
            socket.emit('displayMsg', generateMessage('Welcome'))
            socket.broadcast.to(room).emit('displayMsg', generateMessage(username, `${username} has joined!`));
            io.to(room).emit('showUsers', {
                room,
                users:user.getAllusersInRoom(room)
            });
            callback();
        }
        else {
            callback(new Error('User already exists!'));
            // console.log('User already exists!')
        }
    })
    socket.on('sendMessage', (msg, callback) => {
        const { error, usr } = user.getUser(socket.id);
        if (error)
            return callback(error);
        io.to(usr.room).emit('displayMsg', generateMessage(usr.username, msg));
        callback();
    })
    socket.on('location', ({ lat, long }, callback) => {
        io.emit('getLocation', `https://google.com/maps?q=${lat},${long}`);
        callback();
    })
    socket.on('disconnect', () => {
        const { error, removedUser } = user.removeUser(socket.id);  
        if (removedUser) {
            io.to(removedUser.room).emit('displayMsg', generateMessage(removedUser.username, `${removedUser.username} has left!`));
            io.to(removedUser.room).emit('showUsers', {
                room:removedUser.room,
                users:user.getAllusersInRoom(removedUser.room)
            });
        }
    })
})

server.listen(port, () => {
    console.log('Server is running on ' + port);
})