'use strict';

const pfapi_app = require('./simple-app');
const random = require('./random-refreshable');
const composite = require('./simple-composite');

// a simple middleware
//
module.exports = async (ctx, next) => {
    
    
    if (!pfapi_app.started_at) await pfapi_app.start();
    
    const path = ctx.request.path.replace(/\/+$/, '');

    switch(path) {

        case '/random': {
            await pfapi_app.handle(ctx, random);
            break;
        }

        case '/composite': {
            await pfapi_app.handle(ctx, composite);
            break;
        }

        default:

            await next();
    }

    console.log(`duration: ${ctx.response.get('x-response-time')} path: ${ctx.request.path}`);

}