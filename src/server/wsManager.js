import values from 'lodash/values';
import flatten from 'lodash/flatten';
import without from 'lodash/without';
import pickBy from 'lodash/pickBy';
import isArray from 'lodash/isArray';
import keys from 'lodash/keys';
import { jwtVerify } from './utils/userUtils';
import { offline } from './controllers/loungeController';

var userIdToWebSockets = {};
var wsIdToUserId = {};
var webSocketId = 0;

function handleIncomingConnection(data, ws) {
    // When a user connects via WebSocket, adding
    // a reference to the connection to the maps.
    // Notice the a user might have more than one
    // connection at a time, it's perfectly fine.
    var userId = data.id;
    if (!userIdToWebSockets[userId]) {
        userIdToWebSockets[userId] = [];
    }
    userIdToWebSockets[userId].push(ws);
    ws.webSocketId = webSocketId++;
    wsIdToUserId[ws.webSocketId] = userId;
    ws.send(JSON.stringify({ success: true }));
}

function removeWebSocket(ws) {
    var userId = wsIdToUserId[ws.webSocketId];
    userIdToWebSockets[userId] = without(userIdToWebSockets[userId], ws);
    delete wsIdToUserId[ws.webSocketId];

    if (keys(userIdToWebSockets[userId]).length === 0) {
        offline(userId);
    }
}

function sendMessage(ws, message) {
    if (typeof message !== 'string') {
        try {
            message = JSON.stringify(message);
        }
        catch (e) {
            console.log('stringity', e)
        }

    }

    try {
        ws.send(message);
    }
    catch (e) {
        console.error(e);
    }
}

async function handleIncomingMessage(ws, message) {
    var json;

    try {
        json = JSON.parse(message);
    }
    catch (e) {
        console.error(e);
    }

    if (json && json.token) {
        try {
            // When a connection is initiated, client is
            // required to supply a JWT in order for the
            // server to have the new connection to a
            // specific user. Actually handling the connection
            // only after the token if supplied.
            let user = await jwtVerify(json.token);
            handleIncomingConnection(user, ws);
        }
        catch (e) {
            console.error(err)
        }
    }
}

export function initWebSocket(ws) {
    ws.on('message', message => handleIncomingMessage(ws, message));
    ws.on('close', () => removeWebSocket(ws));
    ws.on('error', () => removeWebSocket(ws));
}

export function broadcast(message, exclude) {
    var picked, list = exclude;

    if (!isArray(exclude)) {
        list = [exclude];
    }

    list = list.map(value => "" + value);

    picked = pickBy(userIdToWebSockets, (ws, userId) => {
        return list.indexOf(userId) === -1;
    });

    flatten(values(picked)).forEach(ws => sendMessage(ws, message));
}

function send(userIds, message) {
    if (!isArray(userIds)) {
        userIds = [userIds];
    }

    userIds.forEach(userId => {
        userIdToWebSockets[userId].forEach(ws => sendMessage(ws, message));
    })
}

export function wsSend(userIds, message) {
    return send(userIds, message);
}