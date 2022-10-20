const { prepare } = require('rechoir');
const interpret  = require('interpret');
prepare(interpret.extensions, './dazzle.config.ts');

(async function () {
    try {
        const foo = require('./dazzle.config.ts')
        console.log(foo);
    } catch (error) {
        console.log(error);
    }
})()

