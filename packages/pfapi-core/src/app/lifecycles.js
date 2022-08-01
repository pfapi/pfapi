'use strict';

const debug_verbose = require('debug')('pfapi-verbose:lifecycles');
const logging = require('./logging');
const uids_config = require('./uids-config');

module.exports = (app, uid) => {
    const result = {
        models: [uid],
        async afterCreate(event) {
            debug_verbose(uid, logging.cmsg(event));
            await app.after_upsert(event);
        },
        async afterUpdate(event) {
            debug_verbose(uid, logging.cmsg(event));
            await app.after_upsert(event);
        },
        async afterDelete(event) {
            debug_verbose(uid, logging.cmsg(event));
            await app.after_delete(event);
        },
        async beforeDeleteMany(event) {
            debug_verbose(uid, logging.cmsg(event));
            await before_delete_many(uid, event);
        },
        async afterDeleteMany(event) {
            debug_verbose(uid, logging.cmsg(event));
            if (event.params.deleted_items && event.result.count > 0) {
                await app.after_delete(event);
            }
        }
    };
    if (uid === uids_config.files_uid) {
        delete result.afterCreate;
    }
    if (uid === uids_config.handle_uid) {
        result.beforeFindOne = (event) => {
            //debug_verbose(uid, logging.cmsg(event));
            update_component_media_populate(event);
        }
        result.beforeFindMany = (event) => {
            //debug_verbose(uid, logging.cmsg(event));
            update_component_media_populate(event);
        }
    }
    return result;
}

function update_component_media_populate(event) {
    if (event.params && event.params.populate) {
        event.params.populate = { attributes: { populate: { media: true } } };
    }
}

async function before_delete_many(uid, event) {
    if (event.params) {
        const items = await strapi.db.query(uid).findMany(event.params);
        if (items && items.length > 0) {
            event.params.deleted_items = items;
        }
    }
}