'use strict';

module.exports = () => {
    let ip = String(1 + Date.now() % 126);
    for (let i = 0; i < 3; i++) {
        const int = Math.floor(Math.random() * 256);
        ip += `.${int}`;
    }
    return ip;
}