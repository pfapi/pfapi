'use strict';

module.exports = async (ctx, http_response, local_cache, redis_cache) => {
    const type = ctx.params.type;
    const key = ctx.params.key;
    if (type == 'local' && local_cache) {
        if (key === 'list') {
            const data = local_cache.list(ctx.query);
            http_response.handle_nocache_request(ctx, 200, data);
            return;
        } else {
            const data = local_cache.get_with_info(key);
            if (data) http_response.handle_nocache_request(ctx, 200, data);
            else http_response.handle_error(ctx, 404, 'Not Found', 'cache-requests');
            return;
        }
    } else if (type === 'redis' && redis_cache) {
        if (key === 'list') {
            const data = await redis_cache.list(ctx.query);
            http_response.handle_nocache_request(ctx, 200, data);
            return;
        } else if (key === 'deps') {
            const data = await redis_cache.deps(ctx.query);
            http_response.handle_nocache_request(ctx, 200, data);
            return;
        } else {
            const data = await redis_cache.get(key);
            if (data) http_response.handle_nocache_request(ctx, 200, data);
            else http_response.handle_error(ctx, 404, 'Not Found', 'cache-requests');
            return;
        }
    }
    http_response.handle_error(ctx, 404, 'Not Found', 'cache-requests');
}