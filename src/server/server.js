import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import https from 'spdy';
import ws from 'ws';
import fs from 'fs';
import LEX from 'letsencrypt-express';
import { jwtMiddleware, jwtLooseMiddleware } from './utils/userUtils';
import { initWebSocket } from './wsManager';
import { requestHandlerWrapper } from './utils/utils';
import { game, answer, leave } from './controllers/gameController';
import { fbLogin, login, signUp } from './controllers/userController';
import { availableUsers, enter } from './controllers/loungeController';
import { acceptInvitation, cancelInvitation, getInvitation,
    rejectInvitation, sendInvitation } from './controllers/invitationController';
import { getSync } from './controllers/syncController';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../www/utils/routes';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from '../www/store/configureStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

let htmlTemplate = getIndexTemplate();

// Express simplistic configuration
let app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
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

// Not serving a favicon.
app.get('/favicon.ico', (req, res) => { res.sendStatus(404); });

// On GET request, try to serve public assets (JS files, manifest);
app.use(express.static('public'));

// If request is not a static file, then it's probably a route
app.get('*', jwtLooseMiddleware, (req, res) => {
    match({ routes: routes, location: req.url }, async (err, redirect, props) => {
        try {
            let store = await configureStore();
            const muiTheme = getMuiTheme(null, { userAgent: req.headers['user-agent'] });
            
            let sync;

            if (req.user) {
                sync = await getSync(req.user.id, null, req.user, req.cookies.token);
            }

            const appHtml = renderToString((
                <Provider store={store}>
                    <MuiThemeProvider muiTheme={muiTheme}>
                        <RouterContext {...props}/>
                    </MuiThemeProvider>
                </Provider>));

            if (process.env.NODE_ENV !== 'production') {
                // Refresh the htmlTemplate global, as it may
                // have a new webpack hash
                htmlTemplate = getIndexTemplate();
            }

            res.send(renderPage(htmlTemplate, appHtml, sync));
        }
        catch (e) {
            console.error('*', e.message, e.stack);
        }

    })
});

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







function renderPage(htmlTemplate, appHtml, initialState) {
    var result =  htmlTemplate.replace('<div id="riddliApp"></div>',
        `<div id="riddliApp">${appHtml}</div>`);

    let xx = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script>`;
    result = result.replace('<script></script>', xx);


    console.log(xx);
    console.log(result);
    console.log(result.indexOf('<script></script>'));

    return result;
}

function getIndexTemplate() {
    return fs.readFileSync('public/index.html', 'utf-8');
}