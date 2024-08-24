const  express = require('express');
// const { Socket } = require('socket.io');
const io = require('socket.io')({
    path:'/webrtc'
})
const app = express();
const port = 8080

app.get('/', (req,res) =>{
    res.send("hello fellows ")
})

const server = app.listen(port , ()=>{
    console.log(`webRTC App is listening on port ${port}`);
    
})
io.listen(server)
// io.listen(server, {
//     // '/socket.io => http://localhost:3000:socket.io/?
//     path:'/webrtc'
// })

const webRTCNamespace = io.of('webRTCPeers')
webRTCNamespace.on('connection', socket =>  {
    console.log(socket.id);
    socket.emit('connection-success', {
        status:'connection-succses',
        socketId :socket.id,
    })

    socket.on('disconnect', ()=>{
        console.log(`${socket.id}  disconnected`);
        
    })

    socket.on('sdp', (data)=>{
        console.log(data);
        socket.broadcast.emit('sdp', data)
    })

    socket.on('candidate', (data)=>{
console.log(data);
socket.broadcast.emit('candidate',data)
    })
})
