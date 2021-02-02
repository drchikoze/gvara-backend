'use strict';

import jwt      from 'jsonwebtoken';
import Base     from '../ServiceBase';
import config   from '../../../etc/config.json';
import X        from '../../Exception';
import mongoose from '../../mongoose';

const secret = config.secret;
const Account   = mongoose.model('Account');

export default class Check extends Base {
    static validationRules = {
        token: [ 'required' ]
    };

    async execute(data) {
        try {
            const decoded = jwt.verify(data.token, secret);
            const existingAccount = await Account.findOne({_id: decoded.id});
            if ( !existingAccount ) {
                return Promise.reject( new X({
                    code: "INVALID_ACCOUNT",
                    fields: {
                        id: "NOT_FOUND"
                    }
                }));
            }
            
            return decoded;
        } catch (err) {
            throw new X({
                code: "INVALID_TOKEN",
                fields: {
                    data: {
                        token: "INVALID_TOKEN"
                    }
                }
            });
        }
    }
}
