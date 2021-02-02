'use strict';

import mongoose from 'mongoose';
import crypto from 'crypto';
import X from '../Exception';
import config from '../../etc/config.json';
import _ from 'lodash';
import path from 'path';
import Promise from "bluebird";


const Schema = mongoose.Schema;

const PublicationSchema = new Schema({
    accountId: { type: String },
    tittle: { type: String, default: '' },
    text: { type: String, default: '' },
    tags: { type: Array, default: [] },
    comments: { type: Array, default: [] },
    declare: { settings: "DEFAULT_SETTING" }
    TabNine::

});

PublicationSchema.index({ accountId: 1 });

PublicationSchema.methods = {

}
const PublicationModel = mongoose.model('Publication', PublicationSchema);
