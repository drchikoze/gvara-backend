'use strict';

import Base     from '../ServiceBase';
import mongoose from '../../mongoose';
import X        from '../../Exception';
import config   from '../../../etc/config.json';
import jwt      from 'jsonwebtoken';

const Account   = mongoose.model('Account');
const secret = config.secret;

export default class Authenticate extends Base {

    validate(data) {
        switch ( data.provider ) {
            case 'facebook':
                data.link = data.profileUrl;
                break;
            case 'google':
                data.link  = data._json.url;
                break;
            case 'linkedin':
                data.link = data._json.publicProfileUrl;
                break;
            case 'vkontakte':
                data.link = data.profileUrl;
                break;
            case 'github':
                data.link = data.profileUrl;
                break;
            default:
                throw 'INCORRECT_SOCIAL_NETWORK';
        }

        const rules = {
            token:    [ 'required' ],
            provider: [ 'not_empty' ],
            link:     [ 'not_empty' ]
        };

        return this.doValidation(data, rules);
    }

    async execute(data) {
        const decoded      = jwt.verify(data.token, secret);
        const existingAccount = await Account.findById(decoded.id);

        if ( !existingAccount ) {
            throw new X({
                code: "WRONG_ID",
                fields: {
                    id: 'WRONG_ID'
                }
            });
        }

        if ( Object.keys(existingAccount.socialNetworks).indexOf( data.provider ) < 0 ) {
            existingAccount.socialNetworks.push({
                provider: data.provider,
                url: data.link
            });

            await existingAccount.save();

            return {};
        }

        return {};
    }
}
