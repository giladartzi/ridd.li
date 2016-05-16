import WebSocket from 'ws';

export default function wsConnect(token) {
    const ws = new WebSocket('ws://localhost:8080');
    let result = { messages: [] };

    ws.on('open', function () {
        ws.send(JSON.stringify({ token }));
    });

    ws.on('message', function(message) {
        result.messages.push(JSON.parse(message));
    });

    return result;
}