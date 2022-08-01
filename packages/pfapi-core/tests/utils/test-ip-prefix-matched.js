'use strict';

const chai = require('chai');
const ip_prefix_matched = require('../../src/utils/ip-prefix-matched');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec tests/utils/test-ip-prefix-matched

describe('Test ip-prefix-matched', () => {

    it('ip null prefix null', async () => {
        const status1 = ip_prefix_matched({ip: '1.2.3.4', path: '/home'}, [{ip_cidr: null, prefix: null, status: 'unlimited'}]);
        expect(status1).equals('unlimited');

        const status2 = ip_prefix_matched({ip: '1.2.3.4', path: '/home'}, [{ip_cidr: null, prefix: null, status: 'blocked'}]);
        expect(status2).equals('blocked');
    });

    it('ip match prefix null', async () => {
        const status1 = ip_prefix_matched({ip: '1.2.3.4', path: '/home'}, [{ip_cidr: '1.2.3.0/24', prefix: null, status: 'unlimited'}]);
        expect(status1).equals('unlimited');

        const status2 = ip_prefix_matched({ip: '1.2.3.4', path: '/home'}, [{ip_cidr: '1.2.4.0/24', prefix: null, status: 'blocked'}]);
        expect(status2).equals(false)
    })

    it('ip null prefix match', async () => {
        const status1 = ip_prefix_matched({ip: '1.2.3.4', path: '/home/page'}, [{ip_cidr: null, prefix: '/home/', status: 'unlimited'}]);
        expect(status1).equals('unlimited');

        const status2 = ip_prefix_matched({ip: '1.2.3.4', path: '/home/page'}, [{ip_cidr: null, prefix: '/admin/', status: 'blocked'}]);
        expect(status2).equals(false);
    })

    it('white hole', async () => {

        const list = [
            {ip_cidr: '1.2.3.0/24', prefix: '/admin/', status: 'unlimited'},
            {ip_cidr: null, prefix: '/admin/', status: 'blocked'},
        ];

        const status1 = ip_prefix_matched({ip: '1.2.3.4', path: '/admin/login'}, list);
        expect(status1).equals('unlimited');

        const status2 = ip_prefix_matched({ip: '1.3.3.4', path: '/admin/login'}, list);
        expect(status2).equals('blocked');
    })

    it('black hole', async () => {

        const list = [
            {ip_cidr: null, prefix: '/admin/', status: 'blocked'},
            {ip_cidr: null, prefix: '/', status: 'unlimited'},
        ];

        const status1 = ip_prefix_matched({ip: '1.2.3.4', path: '/admin/login'}, list);
        expect(status1).equals('blocked');

        const status2 = ip_prefix_matched({ip: '1.3.3.4', path: '/home'}, list);
        expect(status2).equals('unlimited');
    })
});