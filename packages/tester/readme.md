# pfapi-tester

a command line tester for strapi-plugin pfapi

## how to install

```bash
npm install @pfapi/tester -g
```

## get help and demo run

```
> pfapi-tester -h

Usage: pfapi-tester [OPTIONS]...

cli to test strapi plugin pfapi

Options:
  -V, --version         output the version number
  -b, --base_url <url>  base url (default: "http://localhost:1337")
  -p, --path <path>     url path & query string (default: "/pfapi/northern-cities")
  -k, --api_key <key>   pfapi api key (default: "Pfapi-Demo")
  -c, --concurrent      run concurrently
  -f, --fetch_items     fetch each item if there items in response
  -w, --walk_through    walk through all pages
  -t, --times <3>       run how many times (default: "3")
  -d, --delay <ms>      simulate delay within api
  -g, --etag            send if-none-match with etag
  -e, --expires         send if-modified-since with expires
  -s, --sleep <ms>      sleep for ms after each request
  -r, --ss_rand         disable server caches on each request
  -l, --legend          print legend of stats
  -v, --verbose         print verbose details
  -h, --help            display help for command

> pfapi-tester -p /pfapi/pf/northern-cities -t 10 -l

++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10,
  legend: true
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	1.96	3.01	132.06
min	0.85	1.68	98.85
max	10.56	11.54	176.20
------------------------------
all values are in milliseconds.
pfapi: time used by pfapi.
http: time used by http server.
total: round-trip delay + http.
```

**p_response_time**: pfapi response time in ms.

**x_response_time**: strapi response time in ms. 

**total_time**: total time used for the http request in ms.

## .env

setup .env in you work directory can save put into option -b and -k, on each run.

```bash
BASE_URL=http://localhost:1337
API_KEY=Pfapi-Demo-XXXXXX
```

## x-response-time

setup strapi to send x-response-time in the response headers:

```bash
yarn add koa-response-time
```

add following code in file src/index.js

```javascript
...
const responseTime = require('koa-response-time');

module.exports = {
...
  bootstrap({ strapi }) {
    strapi.server.app.use(responseTime({ hrtime: true }));
  },
};
```
