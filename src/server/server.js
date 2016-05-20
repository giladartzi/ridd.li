import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import http from 'http';
import ws from 'ws';
import { jwtMiddleware } from './utils/userUtils';
import { initWebSocket } from './wsManager';

let app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(cors());
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

import * as gameController from './controllers/gameController';

app.get('/game', jwtMiddleware, async (req, res) => {
    let userId = req.user.id;
    
    try {
        res.json(await gameController.game(userId));
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/answer', jwtMiddleware, async (req, res) => {
    try {
        let json = await gameController.answer(req.body.gameId, req.user.id,
            req.body.questionIndex, req.body.answerIndex);

        res.json(json);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

import * as userController from './controllers/userController';
app.post('/register', async (req, res) => {
    try {
        let user = await userController.register(req.body.email, req.body.username, req.body.password);
        res.json(user);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/authenticate', async (req, res) => {
    try {
        let user = await userController.authenticate(req.body.username, req.body.password);
        res.json(user);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

import * as loungeController from './controllers/loungeController';
app.post('/lounge/availableUsers', jwtMiddleware, async (req, res) => {
    try {
        let users = await loungeController.availableUsers(req.user.id);
        res.json(users);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/lounge/enter', jwtMiddleware, async (req, res) => {
    try {
        let result = await loungeController.enter(req.user.id);
        res.json(result);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

import * as invitationController from './controllers/invitationController';
app.post('/invitation/send', jwtMiddleware, async (req, res) => {
    try {
        let invitation = await invitationController.sendInvitation(req.user.id,
            req.user.username, req.body.opponentId);
        res.json(invitation);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/invitation/accept', jwtMiddleware, async (req, res) => {
    try {
        let invitation = await invitationController.acceptInvitation(req.user.id);
        res.json(invitation);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/invitation/reject', jwtMiddleware, async (req, res) => {
    try {
        let invitation = await invitationController.rejectInvitation(req.user.id);
        res.json(invitation);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/invitation/cancel', jwtMiddleware, async (req, res) => {
    try {
        let invitation = await invitationController.cancelInvitation(req.user.id);
        res.json(invitation);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/invitation', jwtMiddleware, async (req, res) => {
    try {
        let invitation = await invitationController.getInvitation(req.user.id);
        res.json(invitation);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

import * as syncController from './controllers/syncController';
app.get('/sync', jwtMiddleware, async (req, res) => {
    try {
        res.json(await syncController.sync(req.user.id));
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
}

var port = 8080;

if (process.env.NODE_ENV === 'production') {
    port = 80;
}

var server = http.createServer(app);
server.listen(port, function () { console.log('Listening on port', port); });
var wsServer = new ws.Server({ server: server });
wsServer.on('connection', initWebSocket);