import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;


const Account = mongoose.model('Account');

export default class RemoveFromFriends extends Base {
    static validationRules = {
        id: [ 'object_id' ]
    };

    async execute(data) {
        const friendsAccount = await Account.findOne({
            _id: data.id
        });

        if (!friendsAccount) {
            throw new X({
                code: "WRONG_ID",
                fields: {
                    data: {
                        id: 'WRONG_ID'
                    }
                }
            });
        }

        const currnetAcount = await Account.findOne({
            _id: this.context.accountId
        });

        if (!currnetAcount.friends.includes(data.id)) {
            console.log('friendsAccount.friends', friendsAccount.friends);
            console.log('data.id', data.id);
            console.log('this.context.accountId', this.context.accountId);
            throw new X({
                code: "WRONG_ID",
                fields: {
                    data: {
                        id: 'WRONG_ID'
                    }
                }
            });
        } else {
            friendsAccount.friends = friendsAccount.friends.filter(friendId => {
                return friendId !== this.context.accountId;
            });
            currnetAcount.friends = currnetAcount.friends.filter(friendId => {
                return friendId !== data.id;
            });

            await currnetAcount.save();
            await friendsAccount.save();

            return {};
        }
    }
}
