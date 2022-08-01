'use strict';

const get_start_limit = require('./get-start-limit');

module.exports = (input = {}) => {

    let {start, limit} = get_start_limit(input);
    
    let page = Math.ceil((start + 1) / limit);
    const pageSize = limit;

    if (input.total === undefined) {
        return { page, pageSize };
    }

    let total = input.total;
    if (isNaN(total)) total = 0;
    if (typeof total !== 'number') total = Number(total);
    if (total < 0) total = 0;

    const pageCount = Math.ceil(total / limit);

    if (start > total) {
        start = total;
        page = pageCount + 1;
    }

    return { page, pageSize, pageCount, total };
}

