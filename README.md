# Strapi plugin pfapi

Pfapi plugin provides fast, secure, configurable, and distributed API services for e-commerce.

* Pfapi uses local and Redis caches to achieve single-digit milliseconds on average API response time. 
* IP unlimited / blocked lists, Rate limits and activities log are accessible through the admin panel. 
* API handles for detail and list views are powered by highly configurable components dynamic zone.
* Configurable filters enable user-friendly UX for users to find what they are looking for.
* Production environment that runs multiple Strapi servers and Redis cluster is tested and supported.

<br>
<img alt="admin panel screenshot" src="https://github.com/pfapi/pfapi/blob/main/images/screen-shot1.png" />

## Requirements

Pfapi plugin requires the in-memory data store Redis. Please refer to: <a href="https://redis.io/docs/getting-started/">install redis server</a> for your environment.


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

## API Routes

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



## API parameters

The same <a href="https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html">Strapi API parameters</a>: sort, filters, populate, fields, pagination and publicationState works for Pfapi.

In additional, groupBy is supported.

For example:

http://localhost:1337/pfapi/northern-cities?groupBy=iso3&sort[population]=desc&api_key=Pfapi-Demo

<details>

<summary>Click to see response</summary>

```javascript
{
  title: 'Northern Cities - Total 11',
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

## Configurable Filters

filters provide an overview of the searched data, the filters data is used to build the user-friendly interface. It helps users to refine their searches. In above examples, we have seen filters data in responses.

<img alt="filters config in admin panel" src="https://github.com/pfapi/pfapi/blob/main/images/screen-shot2.png" />

it is configurable through PfapiHandle with filters_config property under params.

## Security Defense

### 1) IP unlimited list and blocked list

**PfapiIp** conveniently provides access to IP unlimited list and blocked list mechanism. IPs in unlimited list will not check rate limits. IPs in blocked list will not have access to the prefix.

### 2) Rate limits for API calls

**PfapiRateLimit** provides access to the rate limits mechanism. rate limits can set with IP Mask and prefix.

*(it is not the same as the rate limits that come with strapi)*

Changes made to the two collections are effective immediately without restarting strapi servers.

Without enabling the defense middleware of pfapi plugin, the above mechanisms work only for Pfapi APIs.

To enable the defense middleware and cover all routes:

config/middlewares.js

```javascript
module.exports = [
  //...
  'plugin::pfapi.defense',
];
```

## EJS template for text and richtext component fields

We can use the EJS template to customize String fields in the api response JSON object.

For example:

In the northern-city handle,  Northern City - **<%= item.name %>** is the title

## How to use

![components and dynamic zone](https://github.com/pfapi/pfapi/tree/main/images/screen-shot2.png)

The plugin uses the <a href="https://github.com/pfapi/pfapi-core">pfapi-core library</a>. With the world cities test data set provided by plugin strapi-plugin-pfapi-data, we can run a few API calls to demonstrate the idea.

### step 1 install Redis server

Refer to: <a href="https://redis.io/docs/getting-started/">install redis server</a> on your local computer.

### step 2 create strapi app

```bash
yarn create strapi-app strapi-pfapi-app --quickstart 
```

After creating and logging into your Strapi account from the browser, stop the strapi server.

### step 3 install strapi-plugin-pfapi and strapi-plugin-pfapi-data

You don't have to install strapi-plugin-pfapi-data for your production.

strapi-plugin-pfapi-data provides a test data test for demo and test


```bash
cd strapi-pfapi-app

yarn add strapi-plugin-pfapi strapi-plugin-pfapi-data

yarn develop

#after finishing installing data, restart the strapi server

```

![Admin Panel](https://github.com/pfapi/pfapi/tree/main/images/screen-shot1.png)

### step 4 setup api_key and permissions

get your api_key from:

http://localhost:1337/admin/content-manager/collectionType/plugin::pfapi.pfapi-key?page=1&pageSize=10&sort=key:ASC

A role with name PfapiDemo is installed in the above steps.

Go to Settings > USERS & PERMISSIONS PLUGIN > Roles:

![PfapiDemo](https://github.com/pfapi/pfapi/tree/main/images/screen-shot3.png)

http://localhost:1337/admin/settings/users-permissions/roles

click on PfapiDemo,

Under Permissions > World-city

assign **find** and **findOne** permissions to PfapiDemo and click save.

OK, we are ready to run tests, please replace Pfapi-Demo-XXXXXXXX with your specific key or set your api_key to Pfapi-Demo-XXXXXXXX.

### step 5 demos

### a) tests content-type name **world-cities** as path variable

http://localhost:1337/pfapi/world-cities?api_key=Pfapi-Demo-XXXXXXXX

http://localhost:1337/pfapi/world-cities/2148?api_key=Pfapi-Demo-XXXXXXXX

### b) tests config handle **northern-cities** as path variable

handle configs are defined in PfapiHandle.

***/pfapi***

http://localhost:1337/pfapi/northern-cities?api_key=Pfapi-Demo-XXXXXXXX

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo-XXXXXXXX

***/pfapi/pf***

http://localhost:1337/pfapi/pf/northern-cities?api_key=Pfapi-Demo-XXXXXXXX

http://localhost:1337/pfapi/pf/northern-cities/2148?api_key=Pfapi-Demo-XXXXXXXX

***strapi api parameters***

http://localhost:1337/pfapi/northern-cities?filters[iso3]=USA&api_key=Pfapi-Demo-XXXXXXXX

### c) tests with config handle northern-city with id_field is name

config data defined in PfapiHandles for handle **northern-city**:

http://localhost:1337/pfapi/pf/northern-city/Anchorage?api_key=Pfapi-Demo-XXXXXXXX

### d) test data update

goto http://localhost:1337/admin/content-manager/collectionType/api::world-city.world-city/2148

make some change, for example: change the population from 288000 to 288001

check APIs:

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo-XXXXXXXX

http://localhost:1337/pfapi/pf/northern-cities/2148?api_key=Pfapi-Demo-XXXXXXXX

http://localhost:1337/pfapi/pf/northern-city/Anchorage?api_key=Pfapi-Demo-XXXXXXXX

to see if the cached data was evicted and updated

### e) test config update

goto http://localhost:1337/admin/content-manager/collectionType/plugin::pfapi.pfapi-handle/1

make some changes, for example: add or remove country to the fields array

check APIs:

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo-XXXXXXXX

http://localhost:1337/pfapi/pf/northern-cities/2148?api_key=Pfapi-Demo-XXXXXXXX


## pfapi-tester

pfapi-tester is the stress tester for pfapi plugin. please refer to <a href="https://github.com/iamsamwen/pfapi-tester">pfapi-tester readme</a> for detail.

We can use it to get api capacity metrics of APIs that use pfapi plugin.

Here are the raw data collected for the cached vs no cache comparison:
```
# 3 tests for cached data

> pfapi-tester -t 10 
++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	3.13	4.24	134.44
min	0.88	1.78	94.34
max	21.14	22.36	229.76
------------------------------

> pfapi-tester -t 10 
++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	0.97	2.05	125.62
min	0.89	1.82	101.23
max	1.05	3.24	178.90
------------------------------

> pfapi-tester -t 10 
++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	1.07	2.09	132.43
min	0.91	1.79	99.12
max	1.96	2.97	182.29
------------------------------

# 3 tests for no cache data

> pfapi-tester -t 10 -r
++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10,
  ss_rand: true
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	16.93	17.90	142.81
min	16.33	17.27	109.83
max	18.07	18.94	192.21
------------------------------

> pfapi-tester -t 10 -r
++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10,
  ss_rand: true
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	16.74	17.79	147.02
min	16.19	17.13	112.83
max	17.99	19.07	187.56
------------------------------

> pfapi-tester -t 10 -r
++++++++++
{
  base_url: '...',
  path: '/pfapi/pf/northern-cities',
  times: 10,
  ss_rand: true
}
total: 10 ok: 10 not_ok: 0
------------------------------
   	pfapi	http	total
------------------------------
ave	16.72	17.70	135.34
min	16.22	17.15	109.03
max	17.44	18.31	189.94
------------------------------

```


