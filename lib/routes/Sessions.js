'use strict';

import renderPromise from '../render';
import Base          from './Base';

export default class Sessions extends Base {
    create(req, res) {
        const promise = this.run('sessions/Create', {
            params:  req.body
        }).then( result => {
            return { sessions:[result] };
        }).catch( error => {
            return Promise.reject(error);
        });

        renderPromise(req, res, promise);
    }

    check(req, res, next) {
        if ( req.path === '/sessions' && req.method === 'POST' ) {
            return next();
        }

        this.run('sessions/Check', {
            params: {
                token: req.query.token
            }
        }).then( accountData => {
            req.session = {
                context: {
                    accountId : accountData.id,
                    memberId  : accountData.memberId
                }
            };

            return next();
        },
        err => {
            renderPromise(req, res, Promise.reject(err));
        });
    }
}
