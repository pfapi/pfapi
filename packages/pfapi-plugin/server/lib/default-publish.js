'use strict';

// fix default publicationState to live
//
module.exports = (uid, params) => {
    if (!params.publicationState) {
        const meta = strapi.db.metadata.get(uid);
        if (meta.attributes.publishedAt) {
            params.publicationState = 'live';
        }
    }
}