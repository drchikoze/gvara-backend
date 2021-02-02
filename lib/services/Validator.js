'use strict';
/* eslint "consistent-return" :0 */
/* eslint "camelcase" :0 */

import Exception    from '../Exception';
import LIVR         from 'livr';
import moment       from 'moment';
import uuidValidate from 'uuid-validate';

export default class Validator {

    constructor() {
        const defaultRules = {
            object_id() {
                return value => {
                    if (uuidValidate(value, 4)) return;

                    if ( value === undefined || value === null || value === '' ) return;
                    if ( typeof value !== 'string' ) return 'FORMAT_ERROR';
                    if ( value.length < 24 ) return 'WRONG_ID';
                    if ( value.length > 24 ) return 'WRONG_ID';
                    if ( value.match(/[^a-f0-9]/) ) return 'WRONG_ID';
                };
            },

            equal(targetValue) {
                return value  => {
                    if (value === undefined || value === null || value === '' ) return;
                    if ( value !== targetValue ) return 'NOT_EQUAL';
                    return;
                };
            },

            future_date(fromValue) {
                return ( value, params )  => {
                    if (value === undefined || value === null || value === '' ) return;
                    const valueDate = moment(value, moment.ISO_8601);
                    let fromDate;

                    if ( fromValue === 'now' ) {
                        fromDate = moment(new Date().toISOString(), moment.ISO_8601);
                    } else {
                        fromDate = moment(params[fromValue], moment.ISO_8601);
                    }

                    if ( valueDate - fromDate < 0 ) return 'TOO_LOW';
                    return;
                };
            },

            iso_time() {
                return value => {
                    if (value === undefined || value === null || value === '' ) return;
                    const parsedDate = moment(value, moment.ISO_8601);
                    if ( !parsedDate.isValid() ) return 'WRONG_DATE';
                    if ( [ 'YYYY-MM-DDTHH:mm:ss.SSSSZ', 'YYYY-MM-DDTHH:mm:ssZ'].indexOf(parsedDate._f) < 0 ) {
                        return 'WRONG_DATE';
                    }
                    return;
                };
            },

            uniform_object(data) {
                const validator = new LIVR.Validator(data).prepare();

                return function(uniformObject, params, outputArr) {
                    if ( typeof uniformObject !== 'object' ) return 'FORMAT_ERROR';
                    const results = {};
                    const errors = [];
                    const keys = Object.keys(uniformObject);
                    let hasErrors = false;

                    for ( let i = 0; i < keys.length; i++ ) {
                        const prop = {
                            key: keys[i],
                            value: uniformObject[keys[i]]
                        };
                        const result = validator.validate( prop );

                        if ( result ) {
                            results[result.key] = result.value;
                            errors.push(null);
                        } else {
                            hasErrors = true;
                            errors.push( validator.getErrors() );
                            results[result.key] = null;
                        }
                    }

                    if ( hasErrors ) {
                        return errors;
                    }

                    outputArr.push(results);

                    return;
                };
            },

            phone() {
                return value => {
                    if (value === undefined || value === null || value === '' ) return;
                    const valueWithNumbers = value.replace(/[^0-9]|\s/g, '')
                                                  .replace(/\s{1,}/g, '');

                    if ( valueWithNumbers.length !== value.length ) {
                        return 'NOT_ALLOWED_CHARACTER';
                    }

                    return;
                };
            },

            greater_than(targetValue) {
                return ( value, params ) => {
                    if ( value === undefined || value === null || value === '' ) return;
                    if ( params[targetValue] === undefined ||
                         params[targetValue] === null ||
                         params[targetValue] === '' ) return 'NO_TARGET_VALUE';
                    if ( typeof value !== 'number' ) return 'NOT_NUMBER';
                    if ( value < params[targetValue] ) return 'TOO_LOW';
                    return;
                };
            }
        };

        LIVR.Validator.registerDefaultRules(defaultRules);
        LIVR.Validator.defaultAutoTrim(true);
    }

    validate(data, rules) {
        const validator = new LIVR.Validator(rules).prepare();
        const result = validator.validate(data);

        if (!result) {
            const exception = new Exception({
                code:   "FORMAT_ERROR",
                fields: validator.getErrors()
            });

            return Promise.reject(exception);
        }

        return Promise.resolve(result);
    }
}
