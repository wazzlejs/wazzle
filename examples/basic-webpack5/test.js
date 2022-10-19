(async function () {
    try {
        const foo = await import('./dazzle.config.ts')
        console.log(foo);
    } catch (error) {
        console.log(error);
    }
})()

