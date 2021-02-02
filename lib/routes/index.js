'use strict';

import Sessions from './Sessions';

import Accounts from './Accounts';
import Actions from './Actions';
import Publications from './Publications';
import SocialNetworks from './SocialNetworks';

function init() {
    return {
        sessions     : new Sessions(),
        accounts     : new Accounts(),
        actions      : new Actions(),
        publications : new Publications(),
        socialNetworks : new SocialNetworks()
    };
}

module.exports = init;
