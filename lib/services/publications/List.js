import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT = 'most_liked';


const Publication = mongoose.model('Publication');
const Action = mongoose.model('Action');

export default class List extends Base {
    static validationRules = {
        id:          [ 'object_id' ],
        accountId:   [ 'object_id' ],
        offset:      [ 'integer', {'min_number': 0} ],
        limit:       [ 'integer', {'min_number': 0} ],
        sortBy: { one_of : ['most_viewed', 'most_liked', 'most_commented'] },
        filter: { one_of : ['last_week', 'last_mounth', 'last_year'] }
    };

    async execute(data) {
        return data.id ? this._findOneAccount(data.id) : this._findList(data);
    }

    async findOneAccount(id) {
        const existingAccount = await Account.findOne({
            _id: id
        });

        if ( !existingAccount ) {
            throw new X({
                code: "WRONG_ID",
                fields: {
                    data: {
                        id: 'WRONG_ID'
                    }
                }
            });
        }

        return {
            id: existingAccount.id,
            email: existingAccount.email,
            friends: existingAccount.friends
        }
    }
    async _findList(data) {
        if ( data.accountId ) {

        }
        const offset = Number(data.offset) || DEFAULT_OFFSET;
        const limit = Number(data.limit) || DEFAULT_LIMIT;
        const sortBy = data.sortBy || DEFAULT_SORT;
        let publicationActions;
        switch(sortBy) {
            publicationActions = await Action.find({
                type: ''
            });
        }
        const publicationActions = await Action.find({

        });
        const accountsList = await Account.find({
            _id: { $ne: this.context.accountId }
        }).skip(offset).limit(limit);

        const totalAccounts = await await Account.find({
            _id: { $ne: this.context.accountId }
        }).count();

        return {
            total    : totalAccounts,
            entities : accountsList
        };
    }

    async getRelatedActions()

    prepareFindQuery(data) {
        const resultQuery = {
            accountId: data.accountId,

        };


    }
}
