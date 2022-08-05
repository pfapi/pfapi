[![e2e tests](https://github.com/pfapi/pfapi/actions/workflows/e2e-tests.yaml/badge.svg)](https://github.com/pfapi/pfapi/actions/workflows/e2e-tests.yaml) [![release](https://github.com/pfapi/pfapi/actions/workflows/production-release.yaml/badge.svg)](https://github.com/pfapi/pfapi/actions/workflows/production-release.yaml)

# Strapi plugin pfapi

Pfapi plugin uses <a href="https://github.com/pfapi/pfapi/blob/development/packages/pfapi-core/readme.md">pfapi-core library</a> to provide fast, secure, configurable, and scalable API services for e-commerce web apps.

* Pfapi uses local and Redis caches to achieve single-digit milliseconds on average API response time. 
* IP unlimited / blocked lists, Rate limits and activities log are accessible through the admin panel. 
* API handles for detail and list views are powered by highly configurable components dynamic zone.
* Configurable filters enable user-friendly UX for users to find what they are looking for.
* Production environment that runs multiple Strapi servers and Redis cluster is supported and tested.

## Requirements

Pfapi plugin is a Strapi version 4 plugin. It requires the in-memory data store Redis. Please refer to <a href="https://redis.io/docs/getting-started/">Redis getting started</a> to install redis server for your environment.

## How to install

```bash
yarn add strapi-plugin-pfapi

OR

npm install strapi-plugin-pfapi
```

## Config Redis URI


By default, if it is not set, Pfapi uses redis://localhost/0. You can customize it by providing **REDIS_URI** in the plugins config file.

The plugins config file is located at:

config/plugins.js

```javascript
module.exports = ({ env }) => ({
  //...
  pfapi: {
    enabled: true,
    config: {
      redis_uri: env('REDIS_URI'),
    }
  }
  //...
})
```

For Redis cluster config, here is an example:

```bash
REDIS_URI=redis://172.31.23.70:6379,172.31.30.210:6379,172.31.22.214:6379/0
```

## API Handles and Routes

<img alt="admin panel screenshot" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot1.png" />

### List View: /pfapi/:handle

Path variable handle can be a content type plural name or handle defined in PfapiHandle table.

For example: 

http://localhost:1337/pfapi/northern-cities?api_key=Pfapi-Demo

<details>

  <summary>Click to see response</summary>

```javascript
{
  title: 'Northern Cities - Total 595',
  map: {
    id: 3,
    name: 'northern-map',
    alternativeText: 'Northern Map',
    caption: 'Northern Map',
    width: 820,
    height: 820,
    formats: { small: [Object], medium: [Object], thumbnail: [Object] },
    ext: '.jpeg',
    mime: 'image/jpeg',
    size: 110.88,
    url: '/uploads/pfapi/northern_8e902a468b.jpeg'
  },
  filters: [
    {
      key: 'lat',
      type: 'range',
      title: 'Latitude',
      min: 60.016,
      max: 81.7166,
      count: 595,
      full_set: true
    },
    {
      key: 'lng',
      type: 'range',
      title: 'Longitude',
      min: -179.59,
      max: 179.3067,
      count: 595,
      full_set: true
    },
    {
      key: 'population',
      type: 'range',
      title: 'Population',
      min: 0,
      max: 642045,
      count: 595,
      full_set: true
    },
    {
      key: 'country',
      type: 'list',
      title: 'Country',
      items: [
        { value: 'Canada', count: 3, label: 'Canada' },
        { value: 'Faroe Islands', count: 29, label: 'Faroe Islands' },
        { value: 'Finland', count: 209, label: 'Finland' },
        { value: 'Greenland', count: 22, label: 'Greenland' },
        { value: 'Iceland', count: 13, label: 'Iceland' },
        { value: 'Norway', count: 78, label: 'Norway' },
        { value: 'Russia', count: 206, label: 'Russia' },
        { value: 'Svalbard', count: 1, label: 'Svalbard' },
        { value: 'Sweden', count: 14, label: 'Sweden' },
        { value: 'United Kingdom', count: 1, label: 'United Kingdom' },
        { value: 'United States', count: 19, label: 'United States' }
      ],
      full_set: true
    }
  ],
  items: [
    {
      id: 723,
      name: 'Helsinki',
      lat: 60.1756,
      lng: 24.9342,
      population: 642045,
      country: 'Finland',
      iso3: 'FIN'
    },
    {
      id: 778,
      name: 'Reykjavík',
      lat: 64.1475,
      lng: -21.935,
      population: 128793,
      country: 'Iceland',
      iso3: 'ISL'
    },
    {
      id: 813,
      name: 'Nuuk',
      lat: 64.175,
      lng: -51.7333,
      population: 18326,
      country: 'Greenland',
      iso3: 'GRL'
    },
    {
      id: 817,
      name: 'Tórshavn',
      lat: 62,
      lng: -6.7833,
      population: 13326,
      country: 'Faroe Islands',
      iso3: 'FRO'
    },
    {
      id: 849,
      name: 'Longyearbyen',
      lat: 78.2167,
      lng: 15.6333,
      population: 0,
      country: 'Svalbard',
      iso3: 'XSV'
    },
    {
      id: 1782,
      name: 'Surgut',
      lat: 61.25,
      lng: 73.4333,
      population: 360590,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 1816,
      name: 'Arkhangelsk',
      lat: 64.55,
      lng: 40.5333,
      population: 351488,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2023,
      name: 'Yakutsk',
      lat: 62.0272,
      lng: 129.7319,
      population: 311760,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2077,
      name: 'Murmansk',
      lat: 68.9667,
      lng: 33.0833,
      population: 298096,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2148,
      name: 'Anchorage',
      lat: 61.1508,
      lng: -149.1091,
      population: 288000,
      country: 'United States',
      iso3: 'USA'
    },
    {
      id: 2189,
      name: 'Petrozavodsk',
      lat: 61.7833,
      lng: 34.35,
      population: 278551,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2210,
      name: 'Nizhnevartovsk',
      lat: 60.9389,
      lng: 76.595,
      population: 277668,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2253,
      name: 'Espoo',
      lat: 60.21,
      lng: 24.66,
      population: 269802,
      country: 'Finland',
      iso3: 'FIN'
    },
    {
      id: 2335,
      name: 'Bergen',
      lat: 60.3925,
      lng: 5.3233,
      population: 257087,
      country: 'Norway',
      iso3: 'NOR'
    },
    {
      id: 2419,
      name: 'Syktyvkar',
      lat: 61.6667,
      lng: 50.8167,
      population: 245313,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2559,
      name: 'Noginsk',
      lat: 64.4833,
      lng: 91.2333,
      population: 229731,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      id: 2596,
      name: 'Tampere',
      lat: 61.4981,
      lng: 23.76,
      population: 225118,
      country: 'Finland',
      iso3: 'FIN'
    },
    {
      id: 2683,
      name: 'Vantaa',
      lat: 60.3,
      lng: 25.0333,
      population: 214605,
      country: 'Finland',
      iso3: 'FIN'
    },
    {
      id: 2843,
      name: 'Oulu',
      lat: 65.0142,
      lng: 25.4719,
      population: 200526,
      country: 'Finland',
      iso3: 'FIN'
    },
    {
      id: 2997,
      name: 'Turku',
      lat: 60.4517,
      lng: 22.27,
      population: 187604,
      country: 'Finland',
      iso3: 'FIN'
    }
  ],
  pagination: { page: 1, pageSize: 20, pageCount: 30, total: 595 }
}
```

</details>


### Detail View: /pfapi/:handle/:id

Path variable id can be id of an entry in the collection or id_field of the handle if defined.

For example:

http://localhost:1337/pfapi/northern-city/Anchorage?api_key=Pfapi-Demo

<details>

  <summary>Click to see response</summary>

```javascript
{
  title: 'Northern City - Anchorage',
  snow: {
    id: 4,
    name: 'snow-town',
    alternativeText: 'Snow Town',
    caption: 'Snow Town',
    width: 1100,
    height: 695,
    formats: {
      large: {
        ext: '.webp',
        url: '/uploads/pfapi/large_shutterstock_416265475_9c7b4a1b9f.webp',
        hash: 'large_shutterstock_416265475_9c7b4a1b9f',
        mime: 'image/webp',
        name: 'large_shutterstock-416265475.webp',
        size: 49.94,
        width: 1000,
        height: 632
      },
      small: {
        ext: '.webp',
        url: '/uploads/pfapi/small_shutterstock_416265475_9c7b4a1b9f.webp',
        hash: 'small_shutterstock_416265475_9c7b4a1b9f',
        mime: 'image/webp',
        name: 'small_shutterstock-416265475.webp',
        size: 19.35,
        width: 500,
        height: 316
      },
      medium: {
        ext: '.webp',
        url: '/uploads/pfapi/medium_shutterstock_416265475_9c7b4a1b9f.webp',
        hash: 'medium_shutterstock_416265475_9c7b4a1b9f',
        mime: 'image/webp',
        name: 'medium_shutterstock-416265475.webp',
        size: 34.59,
        width: 750,
        height: 474
      },
      thumbnail: {
        ext: '.webp',
        url: '/uploads/pfapi/thumbnail_shutterstock_416265475_9c7b4a1b9f.webp',
        hash: 'thumbnail_shutterstock_416265475_9c7b4a1b9f',
        mime: 'image/webp',
        name: 'thumbnail_shutterstock-416265475.webp',
        size: 6.36,
        width: 245,
        height: 155
      }
    },
    ext: '.webp',
    mime: 'image/webp',
    size: 68.54,
    url: '/uploads/pfapi/shutterstock_416265475_9c7b4a1b9f.webp'
  },
  item: {
    id: 2148,
    name: 'Anchorage',
    lat: 61.1508,
    lng: -149.1091,
    population: 288000
  }
}
```

</details>


Both list view and detail view APIs are aggregated from one or multiple individually cacheable data retrieving methods. 

<details>

<summary>Click to see routes by method name</summary>

* /pfapi/get-filters/:handle

* /pfapi/find-many/:handle

* /pfapi/find-one/:handle/:id

* /pfapi/get-count/:handle


</details>

### EJS template

The EJS template is used to customize string type of components in attributes of Pfapi handles.

For example:

In the northern-city handle, we can set title field as Northern City - **<%= item.name %>**.


## API parameters

1) The same <a href="https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html">Strapi API parameters</a>: sort, filters, populate, fields, pagination, publicationState and locale work for Pfapi.

2) Preview requires permission. **preview=1** enables preview un-published API handle. With **publicationState=preview**, it enables preview un-published collection data. The preview permission is defined in Pfapi Key.

<img alt="preview permission" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot3.png" />

3) **ss_rand=1** makes pfapi not to use cache for data. It gets data directly from data source and not save the result to cache.

4) **groupBy** is supported. For example:

http://localhost:1337/pfapi/northern-cities?groupBy=iso3&sort[population]=desc&api_key=Pfapi-Demo

<details>

<summary>Click to see response</summary>

```javascript
{
  title: 'Northern Cities - Total 11',
  map: [Object],
  filters: [
    {
      key: 'lat',
      type: 'range',
      title: 'Latitude',
      min: 60.016,
      max: 81.7166,
      count: 595,
      full_set: true
    },
    {
      key: 'lng',
      type: 'range',
      title: 'Longitude',
      min: -179.59,
      max: 179.3067,
      count: 595,
      full_set: true
    },
    {
      key: 'population',
      type: 'range',
      title: 'Population',
      min: 0,
      max: 642045,
      count: 595,
      full_set: true
    },
    {
      key: 'country',
      type: 'list',
      title: 'Country',
      items: [Array],
      full_set: true
    }
  ],
  items: [
    {
      name: 'Helsinki',
      lat: 60.1756,
      lng: 24.9342,
      population: 642045,
      country: 'Finland',
      iso3: 'FIN'
    },
    {
      name: 'Surgut',
      lat: 61.25,
      lng: 73.4333,
      population: 360590,
      country: 'Russia',
      iso3: 'RUS'
    },
    {
      name: 'Anchorage',
      lat: 61.1508,
      lng: -149.1091,
      population: 288000,
      country: 'United States',
      iso3: 'USA'
    },
    {
      name: 'Bergen',
      lat: 60.3925,
      lng: 5.3233,
      population: 257087,
      country: 'Norway',
      iso3: 'NOR'
    },
    {
      name: 'Reykjavík',
      lat: 64.1475,
      lng: -21.935,
      population: 128793,
      country: 'Iceland',
      iso3: 'ISL'
    },
    {
      name: 'Umeå',
      lat: 63.8285,
      lng: 20.2706,
      population: 90412,
      country: 'Sweden',
      iso3: 'SWE'
    },
    {
      name: 'Whitehorse',
      lat: 60.7029,
      lng: -135.0691,
      population: 25085,
      country: 'Canada',
      iso3: 'CAN'
    },
    {
      name: 'Nuuk',
      lat: 64.175,
      lng: -51.7333,
      population: 18326,
      country: 'Greenland',
      iso3: 'GRL'
    },
    {
      name: 'Tórshavn',
      lat: 62,
      lng: -6.7833,
      population: 13326,
      country: 'Faroe Islands',
      iso3: 'FRO'
    },
    {
      name: 'Lerwick',
      lat: 60.155,
      lng: -1.145,
      population: 6880,
      country: 'United Kingdom',
      iso3: 'GBR'
    },
    {
      name: 'Longyearbyen',
      lat: 78.2167,
      lng: 15.6333,
      population: 0,
      country: 'Svalbard',
      iso3: 'XSV'
    }
  ],
  pagination: { page: 1, pageSize: 20, pageCount: 1, total: 11 },
  sort: { population: 'desc' }
}
```

</details>

5) **merge_filters=1** forces Pfapi to use the merged filters (handle.params.filters and ctx.query.filters) to generate filters data in list view. By default, filters data of list view is generated from handle params filters only. For example:

http://localhost:1337/pfapi/northern-cities?filters[iso3]=USA&merge_filters=1&api_key=Pfapi-Demo

<details>

<summary>Click to see merged filters filters data</summary>

```javascript
{
  title: 'Northern Cities - Total 19',
  map: [Object],
  filters: [
    {
      key: 'lat',
      type: 'range',
      title: 'Latitude',
      min: 60.4417,
      max: 64.9295,
      count: 19,
      full_set: true
    },
    {
      key: 'lng',
      type: 'range',
      title: 'Longitude',
      min: -161.7917,
      max: -147.3877,
      count: 19,
      full_set: true
    },
    {
      key: 'population',
      type: 'range',
      title: 'Population',
      min: 5169,
      max: 288000,
      count: 19,
      full_set: true
    },
    {
      key: 'country',
      type: 'list',
      title: 'Country',
      items: [ { value: 'United States', count: 19, label: 'United States' } ],
      full_set: true
    }
  ],
  items: [Array],
  pagination: { page: 1, pageSize: 20, pageCount: 1, total: 19 }
}
```

</details>

## Configurable Filters

filters provide an overview of the searched data, the filters data is used to build the user-friendly interface. It helps users to refine their searches. In above examples, we have seen filters data in responses.

<img alt="filters config in admin panel" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot2.png" />

it is configurable through PfapiHandle with filters_config property under params.

## Security and Defense

### 1) API Keys

<img alt="PfapiKey screen shot" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot8.png" />

PfapiKey provides supporting for preview permission and avoids preflight request round-trips when we are in CORS situations. PfapiKey has an associated role. The role defines access permissions of the key.

### 2) IP unlimited list and blocked list

<img alt="PfapiIp screen shot" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot4.png" />

**PfapiIp** conveniently provides access to IP unlimited list and blocked list mechanism. IPs in unlimited list will not check rate limits. IPs in blocked list will not have access to the prefix.

### 3) Rate limits for API calls

<img alt="PfapiRateLimit screen shot" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot5.png" />

**PfapiRateLimit** provides access to the rate limits mechanism. rate limits can set with IP Mask and prefix.

*(it is not the same as the rate limits that come with strapi)*

Changes made to the two collections are effective immediately without restarting strapi server.

Without enabling the defense middleware of pfapi plugin, the above mechanisms work only for Pfapi APIs.

To enable the defense middleware and cover all routes that Strapi server provides:

config/middlewares.js

```javascript
module.exports = [
  //...
  'plugin::pfapi.defense',
];
```

### 4) API activities log

<img alt="PfapiActivity screen shot" src="https://github.com/pfapi/pfapi/blob//development//images/screen-shot6.png" />

API activities are logged with some (default 60 seconds) delay and are kept for few (default 7) days. It makes all API calls observable with detail information. We can use it to make decisions on security, and understand performance related issues.

## pfapi-tester

pfapi-tester is the stress tester for pfapi plugin. please refer to <a href="https://github.com/pfapi/pfapi/blob/development/packages/tester/readme.md">pfapi-tester readme</a> to install and setup koa-response-time for x-response-time.

We can use it to get api capacity metrics of APIs that use pfapi plugin.

```bash
pfapi-tester 
+++
{
  base_url: 'http://localhost:1337',
  path: '/pfapi/northern-cities',
  times: 3
}
total: 3 ok: 3 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	1.89	2.58	10.59
min	1.63	2.19	6.38
max	2.20	2.95	18.10
------------------------------
```

## Setup Demonstration

With the world cities test data set provided by plugin strapi-plugin-pfapi-data, we can run API calls to demonstrate the idea.

<a href="https://github.com/pfapi/pfapi/blob/development/packages/pfapi-plugin/README.md">Click to see detail steps</a>

## Pfapi Core Configuration

Pfapi plugin uses <a href="https://github.com/pfapi/pfapi-core">pfapi-core library</a>. Components of pfapi-core are configurable through Strapi config mechanism. If just need to change a few values, updating by json path is supported: 

For example:

To change time to live for cached data - ttl of Cacheable to 30 minutes, we can set json path to the ttl 'Cacheable.ttl' to 1800000.

pfapi config in config/plugins.js: 

```javascript
module.exports = ({ env }) => ({
  //...
  pfapi: {
    
    enabled: true,
    
    config: {
      
      redis_uri: env('REDIS_URI'),

      'Cacheable.ttl': 1800000,
    
    }
  }
  //...
})
```

<details>

<summary>Click to see full config object of all pfapi-core components</summary>

```javascript

{

    Cacheable: {
    
        // all numbers are in milliseconds
    
        // time to live for data 
        ttl: 900000,
    
        // time to live for info
        info_ttl: 3600000 * 24,
    
        // when it starts to consider as slow
        slow_duration: 500,

        // data ttl in ms since last update to start refresh
        early_refresh_start: 60000,
    
        // if duration is more than early_refresh_duration, start
        early_refresh_duration: 1000,

        // when to enable refresh
        refresh_duration: 200,
    
        // when it is slow, an extra ttl adds to regular data ttl
        extra_ttl: 60000,
    
    },

    LocalCache: {

        // max size of local cache
        max_size: 4096 * 16,
    
        // default ttl of local cache
        default_ttl: 180000,
    
        // run maintenance interval
        timer_interval: 60000,

        // on expire batch_size
        batch_size: 32
    },

    RefreshQueue: {

        batch_size: 64,

        refresh_interval: 180000,

        // refresh the top proportion of queue size
        size_ratio: 0.33,

        // refresh use the proportion of refresh_interval
        time_ratio: 0.33,

        // remove the bottom the proportion of queue size
        remove_ratio: 0.33,

        max_queue_size: 8192 * 2
    },

    RedisPubsub: {
        
        channel_name: 'PUBSUB::CHANNEL',

        exclude_self: false
    },

    HttpResponse: {

        server_name: '',

        stale_secs: 60,

        allow_methods: 'GET, HEAD, OPTIONS',

        content_type: 'application/json; charset=utf-8',

        cors_exposed_headers: 'Authorization, Content-Type, Accept, Accept-Language',
        cors_allow_headers: 'Content-Type, Accept, Accept-Language',
        cors_allow_credentials: true,
        cors_allowed_methods: 'GET, HEAD, OPTIONS',
        cors_max_age: 2592000,

    },

    AppBase: {

        maintenance_interval: 10000,
        
        sync_interval: 3600000,
    
        send_response_time: true,

        enable_log: true,

        keep_log_days: 7,
    },

    RateLimit: [
        {ip_mask: '255.255.255.255', prefix: '', window_secs: 10, max_count: 1000, block_secs: 3600, comment: 'average 100 calls per seconds, 1000 calls within 10 seconds'},
        {ip_mask: '255.255.255.255', prefix: '', window_secs: 300, max_count: 10000, block_secs: 3600, comment: 'average 33 calls per seconds 10000 calls with 5 minutes'}
    ],

    Ip: [
        {localhost: [{ip_cidr: '127.0.0.0/24', prefix: null, status: 'unlimited', comment: 'local loops'}]}
    ],

    DemoRole: {name: 'PfapiDemo', description: 'Pfapi demo role', type: 'pfapidemo'},

    DemoKey: {key: 'Pfapi-Demo', name: 'pfapi', allow_preview: true, blocked: false, comment: 'demo and test key', role: 'PfapiDemo' },

}

```
</details>