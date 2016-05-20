var store;
var reconnectTimeout;

function initWebSocket() {
    let ws = new WebSocket(`ws://${window.location.hostname}:${PORT}`);
    ws.onopen = () => sendInitFrame(ws);
    ws.onclose = reconnect;
    ws.onerror = reconnect;
    ws.onmessage = handleIncomingMessage;
}

function sendInitFrame(ws) {
    ws.send(JSON.stringify({
        token: localStorage.getItem('token')
    }));
}

function reconnect() {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(initWebSocket, 1000);
}

function userIsLoggedIn(store) {
    var token = localStorage.getItem('token');

    if (token) {
        return Promise.resolve(token);
    }

    return new Promise((resolve, reject) => {
        let unsubscribe = store.subscribe(() => {
            let token = store.getState().user.token;
            if (token) {
                unsubscribe();
                resolve(token);
            }
        });
    });
}

function handleIncomingMessage(frame) {
    var json = JSON.parse(frame.data);

    if (json.type && json.payload) {
        store.dispatch(json);
    }
}

export async function init(_store) {
    var token = localStorage.getItem('token');
    store = _store;

    await userIsLoggedIn(store);

    initWebSocket();
}