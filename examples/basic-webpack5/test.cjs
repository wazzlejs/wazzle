(async function () {
    try {
        const foo = require('./dazzle.config.ts')
        console.log(foo);
    } catch (error) {
        console.log(error);
    }
})()

