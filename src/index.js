const path = require('path')
const http = require('http')
const express = require('express')
const app = express()
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage , generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getAllUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const server = http.createServer(app)
const io = socketio(server)
// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('websocket connection')

    socket.on('join',(options , callback)=>{
        const {error , user} =addUser({ id:socket.id , ...options })
        if(error){
           return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcom!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users : getAllUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message , callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(coords , callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    } )

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage ('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users : getAllUsersInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, () => {
    console.log('Server is up on port '+ port)
})
