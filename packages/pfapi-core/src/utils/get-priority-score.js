'use strict';

module.exports = (created_time, duration, count = 1, slow_duration = 1000) => {

    const duration_factor = duration ? duration / slow_duration : 1;
    const age_ms = (Date.now() - created_time) || 1000;
    const usage_factor = count / age_ms * 1000;

    return duration_factor * duration_factor * usage_factor;
}