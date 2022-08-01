'use strict';

const util = require('util');
const axios = require('axios');
const opts = require('./get-options');
const results = require('./get-results');

const etag_expires_map = new Map();

module.exports = get_request;

async function get_request(path_or_url) {

    let url, path;

    if (path_or_url.startsWith('http')) {
        url = path_or_url;
        path = get_path(url);
    } else {
        path = path_or_url;
        if (!path.startsWith('/')) path = '/' + path;
        url = get_url(path);
    } 

    const start_time = process.hrtime.bigint();
    
    const result = {status: undefined, path, delay: opts.delay, p_response_time: 0, x_response_time: undefined};
    
    let items_ids, data;

    try {
        const headers = get_headers(url);
        const response = await axios.get(url, {headers});
        items_ids = save_response(result, url, response);
        data = response.data;
        if (!opts.verbose) process.stdout.write('+');
    } catch (err) {
        const { message, response } = err;
        if (response) {
            save_response(result, url, response);
            if (response.status >= 400) {
                console.log(response.status, message);
            } else {
                if (!opts.verbose) process.stdout.write('-');
            }
        } else {
            console.log({url, message});
        } 
    }

    const end_time = process.hrtime.bigint();
    
    result.total_time = Math.round(Number(end_time - start_time) / 10000 ) / 100;
        
    results.push(result);

    if (opts.sleep) await new Promise(resolve => setTimeout(resolve, opts.sleep));

    if (opts.verbose) {
        console.log(util.inspect({...result, data},  { depth: null, colors: true }));
    }

    if (items_ids && items_ids.length > 0) {
        const promises = [];
        for (const id of items_ids) {
            const url = get_url(path, id);
            if (opts.concurrent) {
                promises.push(get_request(url));
            } else {
                await get_request(url);
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
            promises.length = 0;
        }
    }

    return data;
}   

function get_path(url) {
    const parts = url.split('?')[0].split('/');
    parts.shift(); parts.shift(); parts.shift();
    return '/' + parts.join('/');
}

function get_headers(url) {
    const headers = {};
    if (opts.etag || opts.expires) {
        const etag_expires = etag_expires_map.get(url);
        if (etag_expires) {
            const {etag, expires} = etag_expires;
            if (opts.etag && etag) headers['if-none-match'] = etag;
            if (opts.expires && expires) headers['if-modified-since'] = expires;
        }
    }
    return headers;
}

function save_response(result, url, {status, headers, data}) {
    result.status = status;
    get_times(result, headers);
    if (status === 200) {
        if (opts.etag || opts.expires) {
            const etag = headers['etag'];
            const expires = headers['expires'];
            etag_expires_map.set(url, {etag, expires});
        }
        if (opts.fetch_items && data.items) {
            return data.items.map(x => x.id);
        }
    }
}

function get_url(path, id) {
    if (id) {
        const parts = path.split('?');
        parts[0] += `/${id}`;
        path = parts.join('?');
    }
    let url = opts.base_url + path;
    if (opts.delay) url += url.includes('?') ? `&delay=${opts.delay}` : `?delay=${opts.delay}`;
    if (opts.ss_rand) url += url.includes('?') ? `&ss_rand=${Date.now()}` : `?ss_rand=${Date.now()}`;
    if (opts.api_key) url += url.includes('?') ? `&api_key=${opts.api_key}` : `?api_key=${opts.api_key}`;
    return url;
}

function get_times(result, headers) {
    let x_time = headers['x-pfapi-response-time'];
    if (x_time) {
        result.p_response_time = Number(x_time.split('ms')[0]);
    }
    x_time = headers['x-response-time'];
    if (x_time) {
        result.x_response_time = Number(x_time.split('ms')[0]);
    }
}
