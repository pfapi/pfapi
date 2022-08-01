'use strict';

const qs = require('qs');
const axios = require('axios');

module.exports.api_request = async ({path, query, method = 'GET', body, api_token, base_url = 'http://localhost:1337'}) => {
    try {
        if (!path.startsWith('/')) path = `/${path}`;
        if (!path.startsWith('/api')) path = `/api${path}`;
        const str = query ? '?' + qs.stringify(query, { encodeValuesOnly: true }) : '';
        const url = base_url + path + str;
        const options = { method, url, 
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${api_token}`,
            } 
        };
        if (body) {
            options.headers['content-type'] = 'application/json';
            options.data = body;
        }
        const {status, headers, data} = await axios(options);
        return {status, headers, data};
    } catch (err) {
        if (err.response && err.response.data) {
            const {status, headers, data} = err.response;
            console.error(err.message, err.response.data);
            return {status, headers, data};
        } else {
            console.error(err);
        }
        return {};
    }
}

module.exports.pfapi_request = async ({path, query, key, headers, api_key, base_url = 'http://localhost:1337'}) => {
    try {
        if (!path.startsWith('/')) path = `/${path}`;
        if (!path.startsWith('/pfapi')) path = `/pfapi${path}`;
        if (!query) query = { api_key : key ? key : api_key };
        else if (!query.api_key) query.api_key = key ? key : api_key;
        const str = '?' + qs.stringify(query, { encodeValuesOnly: true });
        const url = base_url + path + str;
        if (!headers) headers = { accept: 'application/json' };
        else headers.accept = 'application/json';
        const {status, data, ...rest} = await axios({ method: 'GET', url, headers });
        return {status, headers: rest.headers, data};
    } catch (err) {
        if (err.response) {
            const {status, headers, data} = err.response;
            console.error(err.message, data);
            return {status, headers, data};
        } else {
            console.error(err);
        }
        return {};
    }
}

module.exports.admin_request = async ({url, method = 'GET', body, email, password, base_url = 'http://localhost:1337'}) => {
    const token = await admin_login({email, password, base_url});
    if (!token) {
        console.error('failed to login');
        return {};
    }
    try {
        const options = {
            method, 
            url: base_url + url, 
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
            } 
        };
        if (body) {
            options.headers['content-type'] = 'application/json';
            options.data = body;
        }
        const {status, headers, data} = await axios(options);
        return {status, headers, data};
    } catch (err) {
        if (err.response) {
            const {status, headers, data} = err.response;
            console.error(err.message, data);
            return {status, headers, data};
        } else {
            console.error(err);
        }
        return {};
    }
}

let admin_token;

async function admin_login({ email, password, base_url}) {
    if (admin_token) return admin_token;
    try {
        const options = {
            method: 'post', 
            url: `${base_url}/admin/login`, 
            data: {email, password},
            headers: {
                accept: 'application/json',
                'content-type': 'application/json'
            }
        };
        const {status, data: {data: {token}}} = await axios(options);
        if (status === 200) {
            return admin_token = token;
        }
    } catch (err) {
        if (err.response) {
            console.error(err.message, err.response.data);
        } else {
            console.error(err);
        }
    }
    return null;
}
