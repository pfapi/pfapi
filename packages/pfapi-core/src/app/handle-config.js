'use strict';

const ignore_keys = [ 'hash', 'provider', 'provider_metadata', 'comment', 'createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy' ];

module.exports = {
    transform_config,
    delete_attrs_file,
    replace_attrs_file,  
}

function transform_config({attributes, ...rest}) {
    const file_ids = [];
    const config = {};
    if (attributes) {
        if (Array.isArray(attributes)) {
            config.attributes = {};
            for (const {name, value, media} of attributes) {
                if (!name) continue;
                if (media) {
                    process_media(media, file_ids);
                    config.attributes[name] = media;
                } else if (value) {
                    config.attributes[name] = value;
                }
            }
        } else {
            config.attributes = attributes;
        }
    }
    for (const [k, v] of Object.entries(rest)) {
        if (v === null || ignore_keys.includes(k)) continue;
        config[k] = v;
    }
    return { file_ids, config };
}

function delete_attrs_file(config, {id}) {
    if (config.attributes) {
        for (const [key, value] of Object.entries(config.attributes)) {
            if (Array.isArray(value)) {
                for (let i = value.length - 1; i >= 0; i--) {
                    if (value[i].id === id) {
                        value.splice(i, 1);
                    }
                }
            } else if (value.id === id) {
                delete config.attributes[key];
            }
        }
    }
}

function process_media(media, file_ids) {
    if (Array.isArray(media)) {
        for (const item of media) {
            process_media(item, file_ids);
        }
    } else {
        if (file_ids && media.id && !file_ids.includes(media.id)) {
            file_ids.push(media.id);
        }
        for (const [k, v] of Object.entries(media)) {
            if (v === null || ignore_keys.includes(k)) delete media[k];
        }
        if (media.formats) {
            for (const [k, v] of Object.entries(media.formats)) {
                for (const [kk, vv] of Object.entries(media.formats[k])) {
                    if (vv === null) delete media.formats[k][kk];
                }
            }
        }
    }
}

function replace_attrs_file(config, data) {
    if (config.attributes) {
        for (const [key, value] of Object.entries(config.attributes)) {
            if (Array.isArray(value)) {
                for (let i = value.length - 1; i >= 0; i--) {
                    if (value[i].id === data.id) {
                        process_media(data);
                        value[i] = data;
                    }
                }
            } else if (value.id === data.id) {
                process_media(data);
                config.attributes[key] = data;
            }
        }
    }
}