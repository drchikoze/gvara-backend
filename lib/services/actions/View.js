import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';

const Action = mongoose.model('Action');

export default class View extends Base {
    static validationRules = {
        data:     ['required', { 'nested_object': {
            targetUserID   : [ 'required', 'object_id' ],
            accountID   : [ 'required', 'object_id' ],
            data: {
                articleId: ['required', 'object_id']
            }
        }}]
    };

    async execute(data) {
        const account = new Action({
            type: 'VIEW',
            ...data.data
        });

        await account.save();

        return {};
    }
}
