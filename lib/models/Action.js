'use strict';

import mongoose from 'mongoose';
import crypto from 'crypto';
import X from '../Exception';
import config from '../../etc/config.json';
import _ from 'lodash';
import path from 'path';
import Promise from "bluebird";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// const ObjectId = Schema.Types.ObjectId;

const ActionSchema = new Schema({
    type: {
        type: String, enum: [
            'LIKE',
            'FOLLOW',
            'VIEW'
        ]
    },
    accountID: { type: ObjectId },
    targetUserID: { type: ObjectId },
    data: { type: Object, required: true, default: {} }
});

ActionSchema.index({ ActionAccount: 1 });

ActionSchema.methods = {
    encryptPassword(password) {
        try {
            const encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    }
}
const ActionModel = mongoose.model('Action', ActionSchema);
