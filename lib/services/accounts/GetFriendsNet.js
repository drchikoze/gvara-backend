
import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';
import _                    from 'lodash';

const Account = mongoose.model('Account');

export default class GetFriendsNet extends Base {
    static validationRules = {
        level:[ 'integer', {'min_number': 1} ]
    };

    async execute(data) {
        const accountsList = await Account.find({});

        const allFriends = this.getFrendsRecursion(
            null,
            this.context.accountId,
            accountsList,
            +data.level
        );

        const entities = allFriends.filter(friendsId => friendsId !== this.context.accountId);
        const uniqueEntities = _.uniq(entities);

        return {
            entities: uniqueEntities
        }
    }

    getFrendsRecursion(prevId, id, accountsList, lvl) {
        if ( lvl <= 0 ) {
            return [];
        }

        const [ currnetAcount ] = accountsList.filter( account => {
            return account.id === id;
        });
        // console.log('lvl', lvl);
        let allFriends = currnetAcount.friends;
        for (let i = 0; i < currnetAcount.friends.length; i++) {
            if ( currnetAcount.friends[i].id !== prevId) {
                const friends = this.getFrendsRecursion(
                    currnetAcount.id,
                    currnetAcount.friends[i],
                    accountsList,
                    lvl - 1
                );

                allFriends = allFriends.concat(friends);
            }
        }

        return allFriends;
    }
}
