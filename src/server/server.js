import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import http from 'http';

let app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(cors());

import * as gameController from './controllers/gameController';

app.post('/createGame', async (req, res) => {
    let userIds = [req.body.userId1, req.body.userId2];
    res.json(await gameController.createGame(userIds));
});

app.get('/game/:userId', async (req, res) => {
    let userId = req.params.userId;
    
    try {
        res.json(await gameController.game(userId));
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/answer', async (req, res) => {
    let json = await gameController.answer(req.body.gameId, req.body.userId,
        req.body.questionIndex, req.body.answerIndex);

    res.json(json);
});

var port = 8080;
var server = http.createServer(app);
server.listen(port, function () { console.log('Listening on port', port); });