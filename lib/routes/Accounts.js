'use strict';

import Base from './Base';
import renderPromise from '../render';
import _ from 'lodash';

export default class Accounts extends Base {
    create(req, res) {
        const promise = this.run('accounts/Create', {
            params: req.body
        }).then(data => {
            return {
                data: accountsData
            };

            return Promise.resolve(data);
        });

        renderPromise(req, res, promise);
    }

    list(req, res) {
        const params = {
            id: req.params.id,
            limit: req.query.limit,
            offset: req.query.offset,
        };
        console.log('list params', params);
        const promise = this.run('accounts/List', {
            session: req.session,
            params
        }).then(accountsData => {
            return {
                data: accountsData
            };

        });

        renderPromise(req, res, promise);
    }

    addToFriends(req, res) {
        const params = {
            id: req.body.id
        };

        const promise = this.run('accounts/AddToFriends', {
            session: req.session,
            params
        }).then(accountsData => {
            return {
                data: accountsData
            };

        });

        renderPromise(req, res, promise);
    }

    getFriendsNet(req, res) {
        const params = {
            level: req.query.level
        };

        const promise = this.run('accounts/GetFriendsNet', {
            session: req.session,
            params
        }).then(accountsData => {
            return {
                data: accountsData
            };

        });

        renderPromise(req, res, promise);
    }

    removeFromFriends(req, res) {
        const params = {
            id: req.body.id
        };

        const promise = this.run('accounts/RemoveFromFriends', {
            session: req.session,
            params
        }).then(accountsData => {
            return {
                data: accountsData
            };

        });

        renderPromise(req, res, promise);
    }
}
