"use strict";

import Exception from './Exception';

export default function renderPromise(req, res, promise) {
    return promise.then( data => {
        return res.send({...data, status : 1});
    }).catch( error => {
        if (error instanceof Exception) {
            res.send({
                status: 0,
                error: error.toHash()
            });
        } else {
            console.error('REQUEST URL ',     req.url);
            console.error('REQUEST PARAMS: ', req.params);
            console.error('REQUEST BODY: ',   req.body);
            console.error('ERROR: ',          error.stack || error);
            console.error('-------------------');

            res.send({
                status: 0,
                error: {
                    code:    'UNKNOWN_ERROR',
                    message: 'Please, contact your system administartor!'
                }
            });
        }
    });
}
