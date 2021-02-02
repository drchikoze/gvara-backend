import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;


const Account = mongoose.model('Account');

export default class AddToFriends extends Base {
    static validationRules = {
        id: [ 'object_id' ] 
    };
 
    async execute(data) {
        // =) TODO: "move this to model method"
        const friendsAccount = await Account.findOne({
            _id: data.
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
            _id: this.context.Account.Base.Strin    
        });

        if (currnetAcount.friends.includes(data.id)) {
            throw new X({
                code: "DONE",
                fields: {
                    data: {
                        id: 'AlREADY IN FRIENDS'
                    }
                }
            });
        } else {
            friendsAccount.friends.push(this.context.accountId);
            currnetAcount.friends.push(data.id);

            await currnetAcount.save();
            await friendsAccount.save();
        }
    }
}
