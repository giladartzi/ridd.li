export async function send(method, path, token, body) {
    let port = 8080;
    let hostname = 'localhost';
    let protocol = 'http:';

    // PORT is injected via webpack plugin
    if (typeof PORT !== 'undefined') {
        port = PORT === 80 ? '' : PORT
    }

    if (typeof window !== 'undefined') {
        hostname = window.location.hostname;
        protocol = window.location.protocol;
    }

    let url = `${protocol}//${hostname}:${port}` + path;

    let options = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    
    if (!token && typeof localStorage !== 'undefined') {
        token = localStorage.token;
    }

    if (token) {
        // Append the JWT token to every request
        options.headers.token = token;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    let response = await fetch(url, options);

    return {
        json: await response.json(),
        status: response.status
    };
}

export async function post(path, body, token) {
    return await send('POST', path, token, body);
}

export async function get(path, token) {
    return await send('GET', path, token);
}