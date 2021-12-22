const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})

var activePeers = []

io.on("connection", (socket) => {

	const opponentIdToreturn = activePeers[Math.floor(Math.random()*activePeers.length)]

	activePeers.push(socket.id);
	console.log('activePeers',activePeers);

	socket.on('getOpponetId',(id)=>{
		io.to(id).emit("returOpponentId", {opponent:opponentIdToreturn,myId:socket.id})
	})

	socket.on("disconnect", (data) => {
		activePeers = activePeers.filter(item => item !== socket.id)
		console.log('activePeers',activePeers);
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		activePeers = activePeers.filter(item => item !== data.to)
		activePeers = activePeers.filter(item => item !== socket.id)
		io.to(data.to).emit("callAccepted", {signal:data.signal,name:data.name,id:socket.id})
		console.log('activePeers',activePeers);
	})

	socket.on('endCall',(data)=>{
		io.to(data.opponent).emit('callEnded')
	})

	socket.on('sendMessage',(data)=>{
		io.to(data.to).emit('messageReceived',data.message)
	})
})

server.listen(5000, () => console.log("server is running on port 5000"))
