'use strict';

import jwt      from 'jsonwebtoken';
import X        from '../../Exception';
import Base     from '../ServiceBase';
import config   from '../../../etc/config.json';
import mongoose from '../../mongoose';

const secret = config.secret;
const Account   = mongoose.model('Account');

export default class Create extends Base {
    static validationRules = {
        sessions: [ 'required', { 'list_of_objects': {
            login:    [ 'required' ],
            password: [ 'required' ]
        }}]
    };

    async execute(data) {
        console.log('1');
        const session = data.sessions[0];
        const existingAccount = await Account.findOne({ email: session.login.toLowerCase() });

        if ( !existingAccount || !existingAccount.checkPassword(session.password) ) {
            throw new X({
                code: 'AUTHENTICATION_FAILED',
                fields: {
                    data: {
                        login:    'INVALID',
                        password: 'INVALID'
                    }
                }
            });
        }

        const token = jwt.sign({id: existingAccount.id}, secret);

        return { jwt: token };
    }
}
