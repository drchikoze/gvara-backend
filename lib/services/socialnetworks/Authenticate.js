'use strict';

import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';
import jwt                  from 'jsonwebtoken';
import config               from '../../../etc/config.json';
// import landingConfig        from '../../../etc/landingConfig.json';
// import {emailSendingWorker} from '../../workers/EmailSendingWorker.js';

const secret       = config.secret;

const Account = mongoose.model('Account');
const Action = mongoose.model('Action');

export default class Authenticate extends Base {}
/* istanbul ignore next */
Authenticate.prototype.validate = function(data) {
    console.log('validate data', data);
    const accountData = this._getSocialNetworkInfo( data );

    accountData.email = data.emails ? data.emails[0].value : '';

    const rules = {
        email            : [ 'required' ],
        provider         : [ 'not_empty' ],
        displayName      : [ 'not_empty' ],
        image            : [ 'not_empty' ],
        token            : [ 'not_empty' ],
        industry         : [ 'not_empty' ],
        country          : [ 'not_empty' ],
        site             : [ 'not_empty' ],
        dateOfBirth      : [ 'not_empty' ],
        sex              : [ 'not_empty' ],
        lang             : [ 'not_empty' ],
        ref              : [ {'min_length': 2} ],
        loginAsOrgMember : [ 'not_empty' ]
    };

    return this.doValidation(accountData, rules);
};

/* istanbul ignore next */
Authenticate.prototype.execute = async function(data) {
    console.log('exec start');
    data.email = data.email.toLowerCase();

    const existingAccount = await Account.findOne({ email : data.email });
    console.log('existingAccount', existingAccount);
    if ( existingAccount ) {
        return this._loginAccount(data, existingAccount);
    }

    return this._createAccount(data);
};

/* istanbul ignore next */
Authenticate.prototype._loginAccount = async function(data, existingAccount) {
    const account = await existingAccount.save();
    const token = jwt.sign({id: account.id}, secret);

    return { jwt: token };
};

/* istanbul ignore next */
Authenticate.prototype._createAccount = async function(data) {
    console.log('_createAccount');
    const accountData = {
        status:             'ACTIVE',
        email:              data.email,
        firstName:          data.displayName.split(' ')[0],
        secondName:         data.displayName.split(' ')[1] ? data.displayName.split(' ')[1] : '',
        socialNetworkToken: data.token,
        avatar:             data.image,
        industry:           data.industry ? data.industry : '',
        country:            data.country ? data.country : '',
        settings: {
            language:       data.lang ? data.lang : 'UK'
        },
        socialNetworks:     [{
            provider: data.provider,
            url:      data.site
        }],
        reference:          data.ref
    };

    if ( data.sex ) {
        accountData.sex = data.sex;
    }

    if ( data.dateOfBirth ) {
        accountData.dateOfBirth = data.dateOfBirth;
    }

    const newAccount = new Account(accountData);
    const account = await newAccount.save();

    const delayedActions = await Action.find({
        'data.email': account.email,
        delayed: true
    });

    const token = jwt.sign({id: account.id}, secret);

    return { jwt: token };
};

/* istanbul ignore next */
Authenticate.prototype._getSocialNetworkInfo = function( data ) {
    switch ( data.provider ) {
        case 'facebook':
            return this._getFacebookInfo( data );
        case 'google':
            return this._getGoogleInfo( data );
        case 'linkedin':
            return this._getLinkedinInfo( data );
        case 'vkontakte':
            return this._getVkontakteInfo( data );
        case 'github':
            return this._getGithubInfo( data );
        default:
            throw 'INCORRECT_SOCIAL_NETWORK';
    }
};

/* istanbul ignore next */
Authenticate.prototype._getFacebookInfo = function( data ) {
    if ( data.gender === 'female' || data.gender === 'male' ) {
        data.sex = data.gender.toUpperCase();
    } else {
        data.sex = 'OTHER';
    }

    if ( data._json.birthday ) {
        data.dateOfBirth  = data._json.birthday;
    }

    data.site  = data.profileUrl;
    data.image = 'https://graph.facebook.com/' + data.id + '/picture?width=400&height=400';

    return data;
};

/* istanbul ignore next */
Authenticate.prototype._getGoogleInfo = function( data ) {
    const szIndex = data.photos[0].value.indexOf('sz=');
    data.image = data.photos[0].value.substring(0, szIndex + 3) + '500';

    data.site  = data._json.url;

    if ( data.gender === 'female' || data.gender === 'male' ) {
        data.sex = data.gender.toUpperCase();
    } else {
        data.sex = 'OTHER';
    }

    if ( data._json.birthday ) {
        data.dateOfBirth  = data._json.birthday;
    }

    return data;
};

/* istanbul ignore next */
Authenticate.prototype._getLinkedinInfo = function( data ) {
    if ( data._json.pictureUrls.values ) {
        data.image = data._json.pictureUrls.values[0];
    } else if ( data.photos.length ) {
        data.image = data.photos[0];
    } else {
        // linkedin do not return url to the default avatar
        data.image = 'https://static.licdn.com/scds/common/u/images/themes/katy/ghosts/person/ghost_person_200x200_v1.png';
    }

    data.industry = data._json.industry;
    data.country  = data._json.location.country.code.toUpperCase();
    data.site     = data._json.publicProfileUrl;

    return data;
};

/* istanbul ignore next */
Authenticate.prototype._getVkontakteInfo = function( data ) {
    data.image = ( data.photos[1] && ( data.photos[1].type === 'photo_max') ) ?
                    data.photos[1].value :
                    data.photos[0].value;
    data.site  = data.profileUrl;

    if ( data.gender === 'female' || data.gender === 'male' ) {
        data.sex = data.gender.toUpperCase();
    } else {
        data.sex = 'OTHER';
    }

    if ( data._json.bdate ) {
        const bday  = data._json.bdate.split('.');
        const day   = bday[0];
        const month = bday[1];
        bday[0] = month;
        bday[1] = day;
        data.dateOfBirth = bday.join('/');
    }

    return data;
};

/* istanbul ignore next */
Authenticate.prototype._getGithubInfo = function( data ) {
    data.displayName = data.displayName ? data.displayName : data.accountname;
    data.image       = data._json.avatar_url + '&s=500';
    data.site        = data.profileUrl;

    return data;
};
