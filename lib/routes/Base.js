'use strict';

/* eslint max-params:0 */

import services  from '../services';
import Validator from '../services/Validator';
import _         from 'lodash';
import pointer   from 'json-pointer';

export default class Base {

    constructor() {
        this.validator = new Validator();
    }

    run(actionName, args) {
        const actionPath = actionName.split('/');
        const startTime  = Date.now();
        const context    = _.cloneDeep(args.session && args.session.context ? args.session.context : {} );

        return new services[ actionPath[0] ][ actionPath[1] ]({
            validator: this.validator,
            context
        }).run(args.params).then(result => {
            return result;
        }).catch(error => {
            if ( error.hasOwnProperty('code') ) {
                error.fields = pointer.dict(error.fields);
            }
            return Promise.reject(error);
        });
    }
}
