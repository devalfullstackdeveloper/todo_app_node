const Validator = require('validatorjs');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
Validator.register('passwordRegx', value => passwordRegex.test(value),
    'password must contain at least one uppercase letter, one lowercase letter and one number');
    
const mobRegex = /^[0-9]{10}$/;
Validator.register('mobRegex', value => mobRegex.test(value),
    'Only Enter 10 Digit Mobile Number');
const validator = (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

module.exports = {
    validator
}; 