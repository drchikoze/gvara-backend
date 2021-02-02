import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';

const Action = mongoose.model('Action');

export default class Follow extends Base {
    static validationRules = {
        data:     ['required', { 'nested_object': {
            targetUserID   : [ 'object_id', { 'max_length': 50 } ],
            accountID   : [ 'object_id', { 'max_length': 50 } ]
        }}]
    };

    async execute(data) {
        const account = new Action({
            type: 'FOLLOW',
            ...data.data
        });

        await account.save();

        return {};
    }
}
