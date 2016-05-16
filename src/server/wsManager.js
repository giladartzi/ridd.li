import values from 'lodash/values';
import flatten from 'lodash/flatten';
import without from 'lodash/without';
import pickBy from 'lodash/pickBy';
import isArray from 'lodash/isArray';
import { jwtVerify } from './utils/userUtils'

var userIdToWebSockets = {};
var wsIdToUserId = {};
var webSocketId = 0;

function handleIncomingConnection(data, ws) {
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
        console.log('send to', userId, 'msg', message)
    })
}

export function wsSend(userIds, message) {
    return send(userIds, message);
}