'use strict';

const install_data = require('./data');

(async () => {
    try {
        await install_data();
    } catch (err) {
        console.log(err.message);
    }
})();