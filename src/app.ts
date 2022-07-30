import express from 'express';
import http from 'http';
import { Server } from 'socket.io'

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send("HELLO, it's WS server");
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(PORT, () => {
    console.log('listening on *:5000');
});