'use strict';

require('dotenv').config();

let port = 1337;

if (process.env.PORT) {
  port = Number(process.env.PORT);
}

module.exports = {

  email: 'pfapi@tester.nowhere',
  password: 'PfapiPlus123',
  api_token: '0b8f41be9c1cc15e15b5b885b6089635c19241f6545cff3bdc8a6132a00a18d66f3a264bfa364442c12134d0d75eeef8fb630283ee64fa6311fb8d2aff4e5e63e15b89080348572df11d64fb202639a85550a9b5608fc582becfc1e7b419265e6fd0303b0df005732b2f9f6bb8ddb36848c39d422e4011721fe8b91a97d1e774',
  api_key: 'Pfapi-Demo',
  base_url: process.env.BASE_URL || `http://localhost:${port}`,

}


