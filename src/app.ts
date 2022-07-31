import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import {v4 as uuidv4} from 'uuid';


const app = express();
const server = http.createServer(app);
const socket = new Server(server, {
    cors: {
        origin: '*',
    }
});

const PORT = process.env.PORT || 5000

export enum eventEnum {
    initMessagesPublished = 'init-messages-published',
    newMessageSent = 'new-message-sent',
    clientUserNameSent = 'client-user-name-sent',
    clientMessageSent = 'client-message-sent'
}


type userInfoType = {
    userName: string;
    userId: string;
}

type messageType = userInfoType & {
    messageId: string;
    messageText: string;
    created_at: number;
}

const messagesList: messageType[] = []
const usersList = new Map()

app.get('/', (req, res) => {
    res.send("HELLO, it's WS server");
});

socket.on('connection', (socketConnectionChannel) => {

    //create anonim user for connection
    let initUser: userInfoType = {userName: 'anonim', userId: uuidv4()}
    usersList.set(socketConnectionChannel, initUser)

    //set name for user
    socketConnectionChannel.on(eventEnum.clientUserNameSent, (userName: string, callback) => {
        if (typeof (userName) !== 'string') {
            return;
        }
        const user = usersList.get(socketConnectionChannel)
        user.userName = userName

        callback(user)
    })

    //send message in chat
    socketConnectionChannel.on(eventEnum.clientMessageSent, (message: string, callback) => {
        if (typeof (message) !== 'string') {
            callback("Bad message")
            return
        }
        if ( message.length > 30) {
            callback("Message max length should be less than 30 symbols")
            return
        }

        const user = usersList.get(socketConnectionChannel)
        const messageItem: messageType = {
            messageId: uuidv4(),
            messageText: message,
            userName: user.userName,
            userId: user.userId,
            created_at: Date.now(),
        }
        messagesList.push(messageItem)
        socket.emit(eventEnum.newMessageSent, messageItem)
    });

    //
    // socket.on('disconnect', () => {
    //     usersList.delete(socketConnectionChannel)
    // })

    socketConnectionChannel.emit(eventEnum.initMessagesPublished, messagesList)

    console.log('user connected')
});

server.listen(PORT, () => {
    console.log(`listening on PORT *:${PORT}`);
});