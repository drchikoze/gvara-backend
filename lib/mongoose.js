'use strict';

import X        from './Exception';
import config   from '../etc/config.json';

const mongoose   = require('mongoose');

mongoose.Promise = global.Promise;

const dbPort = config.db.port;
const dbHost = process.env.TEST_MODE && process.env.TEST_MONGO_HOST
                ? process.env.TEST_MONGO_HOST
                : config.db.host;
const dbName = process.env.TEST_MODE ? config.db.testName : config.db.name;

mongoose.connect(`mongodb://${dbHost}:${dbPort}/${(dbName)}`);



import './models/Account';
import './models/Action';
import './models/Publication';

/* istanbul ignore next */

module.exports = mongoose;
