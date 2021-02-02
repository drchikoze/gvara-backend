import X                    from '../../Exception';
import Base                 from '../ServiceBase';
import mongoose             from '../../mongoose';

const Account = mongoose.model('Account');

export default class Create extends Base {
    static validationRules = {
        data:     ['required', { 'nested_object': {
            email   : [ 'required', 'email', { 'max_length': 50 }, 'to_lc' ],
            password: 'required'
        }}]
    };

    async execute(data) {
        await this.throwIfAccountExists({ email: data.data.email });

        const accountData = {
            email     : data.data.email,
            password  : data.data.password,
            firstName : data.data.email.split('@')[0]
        };

        const account = new Account(accountData);
        await account.save();

        return {
            email     : accountData.email,
            password  : accountData.password,
            firstName : accountData.firstName
        };
    }

    async throwIfAccountExists({ email }) {
        const existingAccount = await Account.findOne({ email });

        if ( existingAccount ) {
            throw new X({
                code: "NOT_UNIQUE",
                fields: {
                    data: {
                        email: 'NOT_UNIQUE'
                    }
                }
            });
        }
    }
}
