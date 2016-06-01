import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import http from 'http';
import https from 'spdy';
import ws from 'ws';
import path from 'path';
import LEX from 'letsencrypt-express';
import { jwtMiddleware } from './utils/userUtils';
import { initWebSocket } from './wsManager';
import { requestHandlerWrapper } from './utils/utils';
import { game, answer, leave } from './controllers/gameController';
import { fbLogin, login, signUp } from './controllers/userController';
import { availableUsers, enter } from './controllers/loungeController';
import { acceptInvitation, cancelInvitation, getInvitation,
    rejectInvitation, sendInvitation } from './controllers/invitationController';
import { getSync } from './controllers/syncController';

// Express simplistic configuration
let app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(cors());
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// gameController routs
app.get('/getGame', jwtMiddleware, requestHandlerWrapper(game));
app.post('/answer', jwtMiddleware, requestHandlerWrapper(answer));
app.post('/game/leave', jwtMiddleware, requestHandlerWrapper(leave));

// userController routes
app.post('/signup', requestHandlerWrapper(signUp));
app.post('/login', requestHandlerWrapper(login));
app.post('/fbLogin', requestHandlerWrapper(fbLogin));

// loungeController routes
app.post('/lounge/availableUsers', jwtMiddleware, requestHandlerWrapper(availableUsers));
app.post('/lounge/enter', jwtMiddleware, requestHandlerWrapper(enter));

// invitationController routes
app.post('/invitation/send', jwtMiddleware, requestHandlerWrapper(sendInvitation));
app.post('/invitation/accept', jwtMiddleware, requestHandlerWrapper(acceptInvitation));
app.post('/invitation/reject', jwtMiddleware, requestHandlerWrapper(rejectInvitation));
app.post('/invitation/cancel', jwtMiddleware, requestHandlerWrapper(cancelInvitation));
app.get('/invitation', jwtMiddleware, requestHandlerWrapper(getInvitation));

// syncController routes
app.get('/sync', jwtMiddleware, requestHandlerWrapper(getSync));

// If environment is production, statically server the public directory.
// In case of 404, still server the public directory's index.html file.
// This way, we can use the react-router's browserHistory object and have nicer URL's
// In development mode, the files will be served by webpack-dev-server.
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
    app.get('*', function (req, res) {
        res.sendFile(path.resolve(__dirname, '../../public/index.html'));
    })
}

var port = 8080;
var server;

function redirectHttp(lex) {
    http.createServer(LEX.createAcmeResponder(lex, function redirectHttps(req, res) {
        res.setHeader('Location', 'https://' + req.headers.host + req.url);
        res.statusCode = 302;
        res.end('<!-- Hello Developer Person! Please use HTTPS instead -->');
    })).listen(80);
}

function serveHttps(lex) {
    console.log(lex.httpsOptions);
    server = https.createServer(lex.httpsOptions, LEX.createAcmeResponder(lex, app)).listen(443);
}

if (process.env.NODE_ENV === 'production') {
    // letsencrypt-express configuration. Is not needed in development
    // environment as we don't use HTTPS in that case.
    port = 80;

    let lex = LEX.create({
        configDir: '/etc/letsencrypt',
        approveRegistration: null
    });

    redirectHttp(lex);
    serveHttps(lex);
}
else {
    server = http.createServer(app);
    server.listen(port, function () { console.log('Listening on port', port); });
}

let wsServer = new ws.Server({ server: server });
wsServer.on('connection', initWebSocket);
