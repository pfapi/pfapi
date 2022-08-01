# Strapi plugin pfapi

Pfapi plugin uses <a href="https://github.com/pfapi/pfapi-core">pfapi-core library</a> to provide fast, secure, configurable, and scalable API services for e-commerce web apps.

<a href="https://github.com/pfapi/pfapi/blob/development/README.md">Click to see full documentation</a>

## Setup Demonstration

With the world cities test data set provided by plugin strapi-plugin-pfapi-data, we can run API calls to demonstrate the idea.

### step 1 install Redis server

Please refer to <a href="https://redis.io/docs/getting-started/">Redis getting started</a> to install redis server on your local computer.

### step 2 create strapi app

```bash
yarn create strapi-app strapi-pfapi-app --quickstart

OR

npx create-strapi-app strapi-pfapi-app --quickstart
```

After creating and logging into your Strapi account from the browser, stop the strapi server.

### step 3 install plugins

You don't have to install strapi-plugin-pfapi-data for your production.

strapi-plugin-pfapi-data provides a test data set for demo and test


```bash
cd strapi-pfapi-app

yarn add strapi-plugin-pfapi strapi-plugin-pfapi-data

yarn develop

OR

npm install strapi-plugin-pfapi strapi-plugin-pfapi-data

npm run develop
```

### step 4 setup api_key and permissions


get your api_key from:

http://localhost:1337/admin/content-manager/collectionType/plugin::pfapi.pfapi-key?page=1&pageSize=10&sort=key:ASC

Please replace Pfapi-Demo-XXXXXXXX with Pfapi-Demo for the convenience of using links posted below.

A role with name PfapiDemo is installed in the above steps.

Go to Settings > USERS & PERMISSIONS PLUGIN > Roles:

<img alt="Setup PfapiDemo role" src="https://github.com/pfapi/pfapi/blob/developement/images/screen-shot7.png" />

http://localhost:1337/admin/settings/users-permissions/roles

click on PfapiDemo,

Under Permissions > World-city

assign **find** and **findOne** permissions to PfapiDemo and click save.

OK, we are ready to run demos.

### step 5 demos

### a) tests content-type name **world-cities** as path variable

http://localhost:1337/pfapi/world-cities?api_key=Pfapi-Demo

http://localhost:1337/pfapi/world-cities/2148?api_key=Pfapi-Demo

### b) tests config handle **northern-cities** as path variable

handle configs are defined in PfapiHandle.

***/pfapi***

http://localhost:1337/pfapi/northern-cities?api_key=Pfapi-Demo

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo

***strapi api parameters***

http://localhost:1337/pfapi/northern-cities?filters[iso3]=USA&api_key=Pfapi-Demo

### c) tests with config handle northern-city with id_field is name

config data defined in PfapiHandles for handle **northern-city**:

http://localhost:1337/pfapi/northern-city/Anchorage?api_key=Pfapi-Demo

### d) test data update

goto http://localhost:1337/admin/content-manager/collectionType/api::world-city.world-city/2148

make some change, for example: change the population from 288000 to 288001

check APIs:

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo

http://localhost:1337/pfapi/northern-city/Anchorage?api_key=Pfapi-Demo

to see if the cached data was evicted and updated

### e) test config update

goto http://localhost:1337/admin/content-manager/collectionType/plugin::pfapi.pfapi-handle/1

make some changes, for example: add or remove country to the fields array

check APIs:

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo

http://localhost:1337/pfapi/northern-cities/2148?api_key=Pfapi-Demo
