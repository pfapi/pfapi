# Strapi plugin pfapi

Pfapi plugin provides fast, secure, configurable, and distributed API services for e-commerce.

* Pfapi uses local and Redis caches to achieve single-digit milliseconds on average API response time. 
* IP unlimited / blocked lists, Rate limits and activities log are accessible through the admin panel. 
* API handles for detail and list views are powered by highly configurable components dynamic zone.
* Configurable filters enable user-friendly UX for users to find what they are looking for.
* Production environment that runs multiple Strapi servers and Redis cluster is tested and supported.

![Admin Panel](https://github.com/pfapi/pfapi/blob/main/images/screen-shot1.png)

## Requirements

Pfapi plugin requires the in-memory data store Redis. Please refer to: <a href="https://redis.io/docs/getting-started/">install redis server</a> on your environment.


## how to install

```bash
yarn add strapi-plugin-pfapi
```
## config Redis URI

By default, if it is not set, Pfapi uses redis://localhost/0.

You can set it to a different host and database number by providing **REDIS_URI** in the plugins config file.

For Redis cluster config, here is an example:

```bash
REDIS_URI=redis://172.31.23.70:6379,172.31.30.210:6379,172.31.22.214:6379/0
```

the plugins config file is located at:

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

## API parameters

The same <a href="https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html">Strapi API parameters</a>: sort, filters, populate, fields, pagination and publicationState works for Pfapi.

In additional, groupBy is supported.

## Configurable Filters

filters provide an overview of the searched data, the filters data is used to build the user-friendly interface. It helps users to refine their searches.

Here is an example:

http://localhost:1337/pfapi/pf/northern-cities?groupBy=iso3&sort[population]=desc&api_key=Pfapi-Demo-XXXXXXX


```javascript
{
  title: 'Northern Cities - Total 11',
...
  filters: [
    {
      key: 'lat', type: 'range', title: 'Latitude', min: 60.02, max: 81.72, count: 595, full_set: true
    },
  ...
    {
      key: 'population', type: 'range', min: 0, max: 642045, count: 595, full_set: true
    },
    { 
      key: 'country', type: 'list', full_set: true,
      items: [
        { value: 'Sweden', count: 14, label: 'Sweden' },
        { value: 'Finland', count: 209, label: 'Finland' },
        ....
    }
  ],
  ...
}
```

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


