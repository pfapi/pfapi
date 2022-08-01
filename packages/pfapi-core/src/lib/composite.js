'use strict';

/**
 * Composite provides mechanism to aggregate multiple data sources into one response
 * 
 * 1) static data: defined within the subclass
 * 2) configurable data: config referred by handle, all name values from attributes property
 * 3) refreshable: will call get_data    
 */
class Composite {

    // static data

    // for example:
    // title: 'static title';

    // refreshable

    // for examples:
    // items = find_many; // refreshable 
    // total = get_total; // refreshable

    // if params has property handle, it will get config with the handle
    // if the config has property attributes, key and values of the 
    // attributes object will assign to the data object

    transform(data, params) {}
}

module.exports = Composite;