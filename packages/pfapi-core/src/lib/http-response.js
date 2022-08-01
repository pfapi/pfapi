'use strict';

const get_config = require('../app/get-config')
const get_body = require('../utils/get-body');
const { get_etag, parse_etag } = require('../utils/etag');

class HttpResponse {

    constructor(request) {
        this.request = request;
        this.config = get_config('HttpResponse');
    }

    handle_cacheable_request(ctx, cacheable) {

        const method = ctx.request.method;

        switch (method) {
            case 'OPTIONS':
                this.handle_options_request(ctx);
                break;
            case 'HEAD':
                this.handle_head_get_request(ctx, cacheable, true);
                break;
            case 'GET': 
                this.handle_head_get_request(ctx, cacheable);
                break;
            default:
                this.handle_error(ctx, 405, `Method Not Allowed: ${ctx.request.method}`);
        }
    }

    handle_error(ctx, status, message = '', name = '', details = {}, data = null) {

        const { headers } = this.prepare_headers(ctx);

        ctx.status = status;
        if (!message) message = ctx.response.message;
        ctx.body = get_body({data, error: {status, name, message, details}});
        ctx.type = this.config.content_type;

        for (const [key, value] of Object.entries(headers)) ctx.set(key, value);

    }

    handle_nocache_request(ctx, status = 200, data, content_type) {

        const method = ctx.request.method;

        if (method === 'OPTIONS' && status < 400) {
            this.handle_options_request(ctx);
            return;
        }
        
        if (method !== 'HEAD' && method !== 'GET' && status < 400) {
            this.handle_error(ctx, 405, `Method Not Allowed: ${ctx.request.method}`);
            return;
        }

        const { headers } = this.prepare_headers(ctx);
        
        if (data && status !== 204 && status !== 304) {
            ctx.body = get_body(data);
            ctx.type = content_type ? content_type : this.config.content_type;
        }

        for (const [key, value] of Object.entries(headers)) ctx.set(key, value);

        ctx.status = status;
    }

    /**
     * helper methods
     */


    handle_origin(ctx, headers) {

        const origin = ctx.get('Origin');
        if (!origin) return;

        if (this.request && this.request.handle_origin) {

            this.request.handle_origin(ctx, headers);

        } else {

            headers['Access-Control-Allow-Origin'] = origin;
            headers['Access-Control-Allow-Credentials'] = this.config.cors_allow_credentials || true;
        }
    }
    
    handle_options(ctx, headers) {

        if (this.request && this.request.handle_options) {

            this.request.handle_options(ctx, headers);
        
        } else {

            const {cors_exposed_headers, cors_allow_headers, cors_allowed_methods, cors_max_age} = this.config;

            headers['Access-Control-Expose-Headers'] = typeof cors_exposed_headers === 'string' ? cors_exposed_headers : cors_exposed_headers.join(', ');
            headers['Access-Control-Allow-Methods'] = typeof cors_allowed_methods === 'string' ?  cors_allowed_methods : cors_allowed_methods.join(', ');
            headers['Access-Control-Allow-Headers'] = typeof cors_allow_headers === 'string' ?  cors_allow_headers : cors_allow_headers.join(', ');
            headers['Access-Control-Max-Age'] = cors_max_age;
    
        }
    }

    handle_head_get_request(ctx, cacheable, head_only = false) {

        const {headers, now_ms} = this.prepare_headers(ctx);

        if (head_only) ctx.status = 204;
        else ctx.status = 200;

        const {data, key, content_type, checksum, timestamp, modified_time, ttl = 900} = cacheable.plain_object;

        const rounded_modified_time = get_rounded_ms(modified_time);

        head_only = this.handle_conditional(ctx, rounded_modified_time, key, checksum, head_only);

        ctx.lastModified = new Date().toGMTString(rounded_modified_time);

        const max_age = Math.round((ttl - (now_ms - timestamp)) / 1000);
        if (max_age > 0) {
            headers['Cache-Control'] = `max-age=${max_age}, private, stale-while-revalidate=${this.config.stale_secs || max_age}`;
            headers['Expires'] = new Date(now_ms + max_age * 1000).toGMTString();
        }

        if (key && checksum) ctx.etag = get_etag({ key, checksum });

        if (data && !head_only) {
            ctx.body = get_body(data);
            if (content_type) {
                ctx.type = content_type;
            } else {
                ctx.type = this.config.content_type;
            }
        }

        for (const [key, value] of Object.entries(headers)) {
            ctx.set(key, value);
        }
    }

    handle_conditional(ctx, modified_time, key, checksum, head_only) {

        const header = ctx.request.header;

        if (header['if-none-match']) {
            const etags = header['if-none-match'].split(',').map(x => x.trim()).filter(x => x);
            for (const etag of etags) {
                const etag_info = parse_etag(etag);
                if (!etag_info) {
                    continue;
                }
                if (etag_info.key === key && etag_info.checksum === checksum) {
                    ctx.status = 304;
                    return true;
                }
            }
            return head_only;
        }

        if (header['if-modified-since']) {
            const if_modified_since = Date.parse(header['if-modified-since']);
            if (modified_time <= if_modified_since) {
                ctx.status = 304;
                return true;
            }
            return head_only;
        }

        return head_only;
    }

    handle_options_request(ctx) {

        const { headers } = this.prepare_headers(ctx);

        this.handle_options(ctx, headers);

        for (const [key, value] of Object.entries(headers)) ctx.set(key, value);

        ctx.status = 204;
    }

    prepare_headers(ctx) {

        const headers = {};

        const now_ms = get_rounded_ms();

        if (this.config.server_name) headers['Server'] = this.config.server_name;

        headers['Date'] = new Date(now_ms).toGMTString();
        headers['Cache-Control'] = 'max-age=0, no-store, must-revalidate';
        headers['Expires'] = new Date(now_ms).toGMTString();

        if (this.config.allow_methods) {
            headers['Allow'] = typeof this.config.allow_methods === 'string' ?
                this.config.allow_methods : this.config.allow_methods.join(', ')
        }

        this.handle_origin(ctx, headers);

        headers['Vary'] = 'Origin';

        return {headers, now_ms}
    }
}

function get_rounded_ms(ms = Date.now()) {
    return Math.round( ms / 1000 ) * 1000;
}

module.exports = HttpResponse;