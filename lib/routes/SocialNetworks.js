'use strict';

import Base          from './Base';
import passport      from 'passport';
import config        from '../../etc/config.json';
import strformat     from 'strformat';
import querystring   from 'querystring';
import renderPromise from '../render';
import X             from '../Exception';

let actionId;
let lang;
let ref = '';
let token;
let continueParam;
let isRequestFromLanding = false;

require('../../etc/passport')(passport);

export default class SocialNetworks extends Base {}

SocialNetworks.prototype.auth = function(req, res) {
    console.log('LOGING');
    console.log('req.path', req.path);
    if ( req.path.split('/').indexOf('google') > -1 ) {
        if ( req.path.split('/').indexOf('callback') ) {
            passport.authenticate('google', { scope : ['profile', 'email'] })(req, res);
        } else {
            this._authenticateAndRedirect(req, res);
        }
    } else if ( req.path.split('/').indexOf('facebook') > -1 ) {
        console.log('facebook logining');
        console.log(req.path.split('/'));
        console.log(req.path.split('/').indexOf('callback'));
        console.log(req.path.split('/').indexOf('callback') < 0);
        if ( req.path.split('/').indexOf('callback') < 0 ) {
            passport.authenticate('facebook', {scope: ['email', 'public_profile']})(req, res);
        } else {
            console.log('try auth');
            this._authenticateAndRedirect(req, res);
        }
    }
    // } else if ( req.path.split('/').indexOf('linkedin') > -1 ) {
    //     if ( req.path.split('/').indexOf('callback') < 0 ) {
    //         passport.authenticate('linkedin', { state: true })(req, res);
    //     } else {
    //         this._authenticateAndRedirect(req, res);
    //     }
    // } else if ( req.path.split('/').indexOf('github') > -1 ) {
    //     if ( req.path.split('/').indexOf('callback') < 0 ) {
    //         passport.authenticate('github', { scope: [ 'account:email' ] })(req, res);
    //     } else {
    //         this._authenticateAndRedirect(req, res);
    //     }
    // } else if ( req.path.split('/').indexOf('vkontakte') > -1 ) {
    //     if ( req.path.split('/').indexOf('callback') < 0 ) {
    //         passport.authenticate('vkontakte', { scope: [ 'email' ] })(req, res);
    //     } else {
    //         this._authenticateAndRedirect(req, res);
    //     }
    // }
};

/* istanbul ignore next */
SocialNetworks.prototype._authenticateAndRedirect = function(req, res) {
    console.log('_authenticateAndRedirect', token);
    if ( token ) {
        req.account.token = token;
        const promise = this.run('socialnetworks/Link', {
            session: req.session,
            params:  req.account
        });

        renderPromise(req, res, promise);
    } else {
        console.log('Authenticate routes');
        req.account.lang = lang;
        req.account.ref = ref;
        const self = this;
        console.log('before service auth');
        this.run('socialnetworks/Authenticate', {
            session: req.session,
            params:  {
                ...req.account
            }
        }).then( async data => {
            console.log('data', data);
            const vars = {
                UIRootUrl: config.UIRootUrl,
                LandingRootUrl: config.LandingRootUrl,
                lang:     lang ? lang.toLowerCase() : 'ru',
                jwt:      data.jwt,
            };

            const redirectUrl = strformat(config.urlPatterns.authRedirect, vars);
            console.log('redirectUrl', redirectUrl);
            res.redirect(redirectUrl);
            // if ( actionId ) {
            //     try {
            //         await self.run('actions/Submit', {
            //             session: req.session,
            //             params: {
            //                 id: actionId,
            //                 token: data.jwt
            //             }
            //         });
            //
            //         res.redirect(redirectUrl);
            //     } catch (err) {
            //         // no error handling if account followed link from shareQuizSession email
            //         // just log him/her in
            //         res.redirect(redirectUrl);
            //     }
            // } else {
            //     res.redirect(redirectUrl);
            // }
        }).catch( (err) => {
            console.log('error', err);
            // this.redirectToErrorPage(req, res, err.fields);
        });
    }
};

/* istanbul ignore next */
SocialNetworks.prototype.redirectToErrorPage = function(req, res, fields) {
    const url = config.urlPatterns.authenticationError;

    const vars = {
        lang: req.query.lang ? req.query.lang.toLowerCase() : 'ru',
        UIRootUrl: config.UIRootUrl
    };

    let query = {};

    for (const prop in fields) {
        if (prop.match(/email/) && fields[prop] === 'REQUIRED') {
            query.email = fields[prop];
        }
    }

    query = querystring.stringify(query);

    const errorUrl = query.length ? strformat(`${url}?${query}`, vars) : strformat(`${url}`, vars);

    res.redirect(errorUrl);
};
