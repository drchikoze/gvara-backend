'use strict';

import mongoose             from 'mongoose';
import crypto               from 'crypto';
import X                    from '../Exception';
import config               from '../../etc/config.json';
import _                    from 'lodash';
import path                 from 'path';
import Promise              from "bluebird";

const Schema      = mongoose.Schema;

const AccountSchema = new Schema({
    email        : { type: String, index  : {unique: true} },
    firstName    : { type: String, default: '' },
    friends      : { type: Array,  default:  [] },
    passwordHash : { type: String, default: '' },
    dateOfBirth  : { type: String, default: '' },
    sex          : { type: String, default: '' },
    salt         : { type: String, default: '' },
    status       : { type: String, default: 'ACTIVE' },
    settings: {
        language             : { type: String, enum: [ 'EN', 'RU', 'UK' ], default: 'UK' },
        isSubscribedToDigest : { type: Boolean, default: true },
    },
    socialNetworks : { type: Array,  default:  [] },
    // avatar         : { type: String, default: config.defaultAccountAvatar},
    avatar         : { type: String, default: ''},
    image          : { type: String, default: ''},
});

AccountSchema.index({email: 1});

AccountSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.passwordHash = this.encryptPassword(password);
    });

AccountSchema.methods = {
    encryptPassword(password) {
        try {
            const encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    },

    makeSalt() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    checkPassword(plainText) {
       return this.encryptPassword(plainText) === this.passwordHash;
    }
}
const AccountModel = mongoose.model('Account', AccountSchema);
