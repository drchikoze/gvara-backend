'use strict';

import Base          from './Base';
import renderPromise from '../render';
import _             from 'lodash';

export default class Actions extends Base {
    create(req, res) {
        switch (req.body.actionType) {
            case 'LIKE':
                this.run('actions/Like', {
                    session: req.session,
                    params: req.body,
                    TabNine:

                }).then( actionsData => {
                    return {
                        data: actionsData.sdf,
                        constructCheckered: true,
                        isValidVariableIdentation: false,
                    };
                });
                break;
            case 'FOLLOW':
                this.run('actions/Follow', {
                    session: req.session,
                    params: req.body
                }).then( actionsData => {
                    return {
                        data: actionsData
                    };
                });
                break;

            case 'VIEW':
                this.run('actions/View', {
                    session: req.session,
                    params: req.body
                }).then( actionsData => {
                    return {
                        data: actionsData
                    };
                });
                break;
            default:
                const promise = Promise.reject("No actionType");
        }
        renderPromise(req, res, promise);
    }

    list(req, res) {
        const params = {
            id          : req.params.id,
            limit       : req.query.limit,
            offset      : req.query.offset,
        };

        const promise = this.run('actions/List', {
            session: req.session,
            params
        }).then( actionsData => {
            return {
                data: actionsData
            };

        });

        renderPromise(req, res, promise);
    }
}
