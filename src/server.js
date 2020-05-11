const WebSocketServer = require('websocket').server;
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const router = app.use(require('./routes'));

const LOCAL = 'http://localhost:3000';
const DEPLOYED = 'https://c09-virtual-desktop.herokuapp.com';
const PORT = process.env.PORT || 3001;

app.use(express.static('build'));
const joinedPath = (PORT === 3001) ? path.join(__dirname, '..', 'public') : path.join(__dirname, 'build');
//app.use((req, res) => res.sendFile('index.html', { root: path.join(__dirname, 'build') }))
app.use((req, res) => res.sendFile('index.html', { root: joinedPath }));
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wssConfig = {
    httpServer: server,
};

const wssServer = new WebSocketServer(wssConfig);
// client object to represent each client
// maybe we turn this into a dictionary later
let Client = function(userId, conn){
    this.userId = userId;
    this.conn = conn;
};

// list of clients connected to server
let clients = [];
let userMap = {}; // maps usernames to userIds


/*  Rooms have the following structure
    rooms: {
        clients
        windows
        windowCount
        windowsOpened
    }
*/
let rooms = {};
let roomCount = 0;

// date + random number for a unique userId, this will be useful later on
// if we want to tell users apart from one another
let getUserId = function() {
    return new Date().getTime().toString() + Math.floor(Math.random() * 10000);
};

let originIsAllowed = function(origin){
    if (origin !== LOCAL && origin !== DEPLOYED){
        return false;
    }
    return true;
};

let initWindows = (msg, userId, conn) => {
    const room = rooms[msg.roomId];
    room.clients.push(userId);
    conn.send(JSON.stringify({ 
        event: 'windowUpdated', 
        data: room.windows, 
        windowCount: room.windowCount,
        windowsOpened: room.windowsOpened
    }));
};

let userLoggedIn = (msg, userId) => {
    let username = msg.username;
    if (userMap.hasOwnProperty(username) && !userMap[username].includes(userId)) {
        userMap[msg.username].push(userId);
    } else {
        userMap[msg.username] = [userId];
    }
};

let moveWindow = (msg, userId) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id] = {
        ...room.windows[msg.id],
        ...msg.data,
    };
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function(client){
        if (client.userId !== userId && room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let addWindow = (msg) => {
    if (msg.window.type === 'blank' || msg.window.type === 'notepad'){
        let room = rooms[msg.roomId];
        msg.window.id = room.windowCount++;
        room.windowsOpened++;
        room.windows[msg.window.id] = {
            ...msg.window,
            type: msg.window.type,
        };
        let res = JSON.stringify({event: 'windowUpdated', data: room.windows, windowCount: room.windowCount, windowsOpened: room.windowsOpened});
        clients.forEach(function(client){
            if (room.clients.includes(client.userId)) {
                client.conn.send(res);
            }
        });
    }
    else if (msg.window.type === 'videoPlayer') {
        let room = rooms[msg.roomId];
        const keys = Object.keys(room.windows);
        let playerExists = false;
        keys.forEach(function(key){
            if (room.windows[key].type === 'videoPlayer') playerExists = true;
        });
        // else we make a new video player
        if (!playerExists) {
            msg.window.id = room.windowCount++;
            msg.window.content = {videoId: "dQw4w9WgXcQ", playing: false};
            room.windowsOpened++;
            room.windows[msg.window.id] = {
                ...msg.window,
                type: msg.window.type,
            };
            let res = JSON.stringify({event: 'windowUpdated', data: room.windows, windowCount: room.windowCount, windowsOpened: room.windowsOpened});
            clients.forEach(function(client){
                if (room.clients.includes(client.userId)) {
                    client.conn.send(res);
                }
            });
        }
    }
    else if (msg.window.type === 'browser') {
        let room = rooms[msg.roomId];
        msg.window.id = room.windowCount++;
        msg.window.content = {url: "https://thierrysans.me/CSCC09/"};
        room.windowsOpened++;
        room.windows[msg.window.id] = {
            ...msg.window,
            type: msg.window.type,
        };
        let res = JSON.stringify({event: 'windowUpdated', data: room.windows, windowCount: room.windowCount, windowsOpened: room.windowsOpened});
        clients.forEach(function(client){
            if (room.clients.includes(client.userId)) {
                client.conn.send(res);
            }
        });
    }
    else if (msg.window.type === 'imageViewer') {
        let room = rooms[msg.roomId];
        msg.window.id = room.windowCount++;
        msg.window.content = "";
        room.windowsOpened++;
        room.windows[msg.window.id] = {
            ...msg.window,
            type: msg.window.type,
        };
        let res = JSON.stringify({event: 'windowUpdated', data: room.windows, windowCount: room.windowCount, windowsOpened: room.windowsOpened});
        clients.forEach(function(client){
            if (room.clients.includes(client.userId)) {
                client.conn.send(res);
            }
        });
    }
};

let setFocus = (msg) => {
    let room = rooms[msg.roomId];
    const keys = Object.keys(room.windows);
    // z position of the component being clicked
    const z = msg.data;
    // decrement every window's z index whose z is greater
    keys.forEach(function(key){
        const window = room.windows[key];
        if (window.z > z) {
            window.z--;
        }
    });
    room.windows[msg.id].z = room.windowCount;
    room.windows[msg.id].show = true;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client) {
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let closeWindow = (msg) => {
    let room = rooms[msg.roomId];
    // delete window since we are closing it
    delete room.windows[msg.id];
    // re-index the z values of all remaining windows
    const keys = Object.keys(room.windows);
    const z = msg.data;
    keys.forEach(function(key){
        const window = room.windows[key];
        if (window.z > z) {
            window.z--;
        }
    });
    room.windowsOpened--;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows, windowsOpened: room.windowsOpened});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let minimizeWindow = (msg) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id].show = false;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let rewindVideo = (msg) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id].content.playing = false;
    room.windows[msg.id].content.time = 0;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let pauseVideo = (msg) => {
    let room = rooms[msg.roomId];
    if (!room.windows[msg.id].content.playing) return;
    room.windows[msg.id].content.playing = false;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let playVideo = (msg) => {
    let room = rooms[msg.roomId];
    if (room.windows[msg.id].content.playing) return;
    room.windows[msg.id].content.playing = true;
    let playVideo = function(id, duration, time) {
        // if window was closed or no longer playing
        if (!room.windows[id] || !room.windows[id].content.playing){
            return;
        }
        room.windows[id].content.time = time;
        if (time > duration) {
            room.windows[id].content.time = 0;
            room.windows[id].content.playing = false;
            return;
        }
        setTimeout(playVideo, 1000, id, duration, time + 1);
    };
    playVideo(msg.id, msg.duration, room.windows[msg.id].content.time || 0);
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let updateNote = (msg) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id].content = msg.data;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let createRoom = (msg, conn) => {
    roomCount++;
    rooms[roomCount] = {
        name: msg.roomName,
        owner: msg.username,
        private: msg.private,
        clients: [],
        members: [msg.username],
        windows: {},
        windowCount: 0,
        windowsOpened: 0
    };

    let newRooms = JSON.stringify({ event: 'roomsUpdated', data: rooms });
    clients.forEach(function(client){
        client.conn.send(newRooms);
    });

    let res = JSON.stringify({ event: 'roomCreated', roomId: roomCount });
    conn.send(res);
};

let inviteToRoom = (msg) => {
    let room = rooms[msg.roomId];
    if (!room.members.includes(msg.user)) {
        room.members.push(msg.user);
    }

    let res = JSON.stringify({ event: 'invitedToRoom', data: rooms, roomId: msg.roomId });
    clients.forEach(function(client) {
        if (userMap.hasOwnProperty(msg.user) && userMap[msg.user].includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let getRooms = (conn) => {
    let res = JSON.stringify({ event: 'roomsUpdated', data: rooms });
    conn.send(res);
};

let leaveRoom = (msg, userId) => {
    if (rooms.hasOwnProperty(msg.roomId)) {
        let room = rooms[msg.roomId];
        let clientIndex = room.clients.indexOf(userId);
        if (clientIndex > -1) {
            room.clients.splice(clientIndex, 1);
        }
    }
};

let deleteRoom = (msg) => {
    let room = rooms[msg.roomId];
    if (room.owner === msg.username) {
        if (room.clients.length === 0) {
            delete rooms[msg.roomId];
            clients.forEach(function (client) {
                client.conn.send(JSON.stringify({ 
                    event: 'roomsUpdated',
                    data: rooms
                }));
            });
        } else {
            clients.forEach(function (client) {
                if (room.clients.includes(client.userId)) {
                    client.conn.send(JSON.stringify({
                        event: 'roomDeleted'
                    }), () => {
                        let index = room.clients.indexOf(client.userId);
                        room.clients.splice(index, 1);

                        if (room.clients.length === 0) {
                            delete rooms[msg.roomId];
                            clients.forEach(function (client) {
                                client.conn.send(JSON.stringify({ 
                                    event: 'roomsUpdated',
                                    data: rooms
                                }));
                            });
                        }
                    });
                }
            });
        }
    }
};

let changeVideoId = (msg) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id].content = {videoId: msg.videoId, playing: false};
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let changeBrowserUrl = (msg) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id].content.url = msg.url;
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

let imageSent = (msg) => {
    let room = rooms[msg.roomId];
    room.windows[msg.id].content = {url: `/room/${msg.roomId}/window/${msg.id}`, imageSet: true};
    let res = JSON.stringify({event: 'windowUpdated', data: room.windows});
    clients.forEach(function (client){
        if (room.clients.includes(client.userId)) {
            client.conn.send(res);
        }
    });
};

wssServer.on('request', function (req) {
    // accept only localhost and from our main page
    if (!originIsAllowed(req.origin)){
        req.reject();
        return;
    }
    const conn = req.accept(null, req.origin);

    let userId = getUserId();
    clients.push(new Client(userId, conn));

    // automatically close websockets for clients that have also closed their ends
    conn.on('close', function(code, desc){
        let i = clients.findIndex(function(client){
            return client.userId === userId;
        });
        if (i !== -1) clients.splice(i, 1);

        Object.keys(userMap).forEach(function(user) {
            let i = userMap[user].indexOf(userId);
            if (i !== -1) {
                userMap[user].splice(i, 1);
                if (userMap[user].length === 0) delete userMap[user];
            }
        });
    });

    // this is a callback for when the socket receives a message from any client
    conn.on('message', function (message){
        if (message.type === 'utf8') {
            let msg;
            try {
                msg = JSON.parse(message.utf8Data);
            }
            catch (err) {
                conn.close();
            }
            switch(msg.event){
                case 'initWindows':
                    initWindows(msg, userId, conn);
                    break;
                case 'userLoggedIn':
                    userLoggedIn(msg, userId);
                    break;
                case 'moveWindow':
                    moveWindow(msg, userId);
                    break;
                case 'resizeWindow':
                    moveWindow(msg, userId);
                    break;
                case 'addWindow':
                    addWindow(msg);
                    break;
                case 'setFocus':
                    setFocus(msg);
                    break;
                case 'closeWindow':
                    closeWindow(msg);
                    break;
                case 'minimizeWindow':
                    minimizeWindow(msg);
                    break;
                case 'rewindVideo':
                    rewindVideo(msg);
                    break;
                case 'pauseVideo':
                    pauseVideo(msg);
                    break;
                case 'playVideo':
                    playVideo(msg);
                    break;
                case 'updateNote':
                    updateNote(msg);
                    break;
                case 'createRoom':
                    createRoom(msg, conn);
                    break;
                case 'inviteToRoom':
                    inviteToRoom(msg);
                    break;
                case 'getRooms':
                    getRooms(conn);
                    break;
                case 'leaveRoom':
                    leaveRoom(msg, userId);
                    break;
                case 'deleteRoom':
                    deleteRoom(msg);
                    break;
                case 'changeVideoId':
                    changeVideoId(msg);
                    break;
                case 'changeBrowserUrl':
                    changeBrowserUrl(msg);
                    break;
                case 'imageSent':
                    imageSent(msg);
                    break;
                default:
                    conn.close();
            }
        }
    });
});