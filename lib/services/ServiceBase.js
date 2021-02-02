'use strict';

import LIVR from 'livr';
import Exception from '../Exception';

export default class Base {
    constructor(args) {
        if (!args.context) throw "context required";

        this.context = args.context;
        this.validator = args.validator;
    }

    async run(params) {
        const cleanParams = await this.validate(params);
        return await this.execute(cleanParams);
    }

    validate(data) {
        const validator = this.constructor.validator || new LIVR.Validator(this.constructor.validationRules).prepare();
        this.constructor.validator = validator;

        return this._doValidationWithValidator(
            data,
            validator
        );
    }

    doValidation(data, rules) {
        const validator = new LIVR.Validator(rules).prepare();
        return this._doValidationWithValidator(data, validator);
    }

    _doValidationWithValidator(data, validator) {
        const result = validator.validate(data);

        if (!result) {
            const exception = new Exception({
                code:   "FORMAT_ERROR",
                fields: validator.getErrors()
            });

            return Promise.reject(exception);
        }

        return result;
    }
}
