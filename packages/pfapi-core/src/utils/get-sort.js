'use strict';

module.exports = (sort) => {
    
    if (!sort) return;

    if (!Array.isArray(sort)) sort = [ sort ];

    for (let i = 0; i < sort.length; i++) {
        if (!sort[i].includes(':')) sort[i] += ':asc';
    }

    return sort;
}