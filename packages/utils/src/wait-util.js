'use strict';

const axios = require('axios');

module.exports = {
    wait_util_ready,
    wait_util_health,
}

async function wait_util_ready(port = 1337) {

    if (!await wait_util_health(port)) {
        process.exit(1);
    };

    try {
        const { status } = await axios.get(`http://localhost:${port}/admin`);
        if (status === 200) {
            console.log('OK!');
        } else {
            console.log('NOT OK!');
            process.exit(1);
        }
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }

}

async function wait_util_health(port, timeout = 180000) {

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const start_ms = Date.now();

    while (Date.now() - start_ms < timeout) {
        try {
            await axios.head(`http://localhost:${port}/_health`);
            return true;
        } catch (err) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('wait_util_ready timeout', timeout);

    return false;
}