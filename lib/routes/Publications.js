'use strict';

import Base          from './Base';
import renderPromise from '../render';
import _             from 'lodash';

export default class Publications extends Base {
    create(req, res) {

    }

    create(req, res) {
        const promise = this.run('publications/Create', {
            params:  req.body
        }).then(publicationData => {
            return {
                data: publicationData
            };
        });

        renderPromise(req, res, promise);
    }

    list(req, res) {
        const params = {
            id          : req.params.id
            
            limit       : req.query.limit,
            offset      : req.query.offset,
        };

        const promise = this.run('publications/List', {
            session: req.session,
            params
        }).then( publicationData => {
            return {
                data: publicationData
            };
        });

        renderPromise(req, res, promise);
    }
}
