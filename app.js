'use strict';

import express from 'express';
// import http                      from 'http';
// import io                        from 'socket.io';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';

import config from './etc/config.json';

const appPort = config.appPort;

const app = express();
const router = new express.Router();
const server = app.listen(appPort);
var io = require('socket.io')(server);

app.use(bodyParser.json({
    limit: 1024 * 1024, verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.send({
                status: 0,
                error: {
                    code: 'BROKEN_JSON',
                    message: 'Please, verify your json'
                }
            });
        }
    }
}));

app.use(bodyParser.urlencoded());
app.use(cors({ origin: '*' }));
app.use(passport.initialize());
app.use(passport.session());

const routes = require('./lib/routes')();
const checksession = routes.sessions.check.bind(routes.sessions);


app.use('/api/v1', router);
// Status

router.post('/accounts', checksession, routes.accounts.create.bind(routes.accounts));

// router.get('/accounts/list', checksession, routes.accounts.list.bind(routes.accounts));
router.get('/accounts', checksession, routes.accounts.list.bind(routes.accounts));
router.get('/accounts/{id}', checksession, routes.accounts.list.bind(routes.accounts));
router.post('/accounts/addToFriends', checksession, routes.accounts.addToFriends.bind(routes.accounts));
router.post('/accounts/removeFromFriends',
    checksession,
    routes.accounts.removeFromFriends.bind(routes.accounts
    ));
router.get('/accounts/getFriendsNet', checksession, routes.accounts.getFriendsNet.bind(routes.accounts))
// Sessions
router.post('/sessions', checksession, routes.sessions.create.bind(routes.sessions));

// SOCIAL networks

// facebook -------------------------------
router.get('/auth/facebook', routes.socialNetworks.auth.bind(routes.socialNetworks));

router.get(
    '/auth/facebook/callback', function (req, res) {


        passport.authenticate('facebook', function (err, account) {
            if (err) {
                routes.socialNetworks.redirectToErrorPage(req, res);
            } else if (!account) {
                res.redirect(loginPage);
            } else {
                req.account = account;

                routes.socialNetworks.auth(req, res);
            }
        })(req, res);
    }
);


console.log(`server started on port ${appPort}`);

io.on('connection', (socket) => {
    // console.log('We have user connected !', socket.id);
    socket.broadcast.emit('an event', { some: 'data' });
    // This event will be emitted from Client when some one add comments.
    socket.on('userConnected', (data) => {
        // Add the comment in database.
        // console.log('We have new comment!', data);
    });
});



module.exports = app;
