[![tests](https://github.com/pfapi/pfapi/actions/workflows/e2e-tests.yaml/badge.svg)](https://github.com/pfapi/pfapi/actions/workflows/e2e-tests.yaml)

# pfapi-core

**P** stands for Powerful, **F** stands for Fast.

pfapi core is a library that helps write Strapi Plugins to provide fast, secure, configurable and scalable API services.

It uses local and Redis caches to keep data. Strapi life cycle events help to evict invalid cached data. It refreshes the data before or after expiration for slow apis based on a priority score. The score calculates from api usage and runtime duration. 

With database indexing and query optimizations, the single-digit milliseconds API average response time goal is achievable for most web applications.

pfapi-core uses HTTP headers: etag, cache-control, expires, if-modified-since and if-none-match to take advantage of the browser-side cache. It reliefs impact of round-trip delay and data traffic between browser and api server.

The Refreshable class makes it possible to get data from Strapi Entity Service API, Query Engine API, other API services and databases. The Composite class aggregates multiple Refreshable results and name value components of dynamic zone into one response. Query params, such as fields, filters, populate, etc., are defined in the config and accessible without delay through the local cache.

<img alt="pfapi test setup in AWS" src="https://github.com/pfapi/pfapi/blob/development/images/aws-test.png" />

It supports production environment that runs multiple Strapi servers and Redis cluster to avoid single-point failure. It auto-reconnects to the Redis server if it restarted.

It is powerful, extensible, and can efficiently serve the data retrieving services.

## How Lifecycle Events are Used to Evict Invalid Cached Data

As a web app grows to a certain scale, it is often found that data accessing becomes a performance bottleneck. Data caching techniques are used to improve the situation.

A simple way to cache data is to save the data in the Redis cache with a key and time to live (TTL). When we need the data, we check the cache first, if not found, we query it from the database, and save the result in the cache for late use.

This approach works great for very frequently used and almost no change data. If there are some data changes, it serves the stale data in the cache until the data expires. Due to this issue, the TTL is forced to be short enough so that the impacts of serving stale data can be acceptable. Short TTL makes the cache very inefficient.

Strapi Lifecycle events provide a perfect solution to the problem – the mechanism to evict invalid cached data. After setting up the subscriptions for afterUpdate and afterDelete events, whenever there is data changing or deleting, an event will generate and trigger the process to delete or update the invalid data in the cache. 

With this implementation, theoretically, the only constraint to TTL value is how much data the cache can hold. In practice, due to performance requirements, some cache data we may decide not to evict as tradeoffs during implementation.

In the detail, the event includes uid and id of the changed or deleted entry. But the cached data is the result of calling API handler, it often is a transformed or aggregated result of one or many entries. So, the API handler needs to return both response data and dependencies (list of uid and id) of the data. pfapi-core maintains dependencies in such a way, that we can get the list of dependent cached data keys by uid and id. Once we have the cached data keys, we can perform the eviction or updating operation on each of them.

In addition to Redis, a local memory cache layer is added. it uses the same mechanism to evict invalid data. The local memory cache layer uses a smaller TTL and holds fewer data. Data in it are accessible immediately without any wait. It also saves the round-trip delay to the Redis servers – normally below 20 milliseconds in a VPC environment. The local memory cache also holds some frequently used data permanently. The triggered action for permanent data is updating instead of deleting.

In a real production environment, it is often two or more Strapi servers run behind a reverse HTTP proxy (for example, AWS Elastic Load Balancer) in a VPC. The reverse proxy serves as a load balancer and HTTPS to HTTP converter. In such a setup, the lifecycle events are only triggered on the server that makes the changing or deleting. Other Strapi servers do not know about it.

To solve this problem, Pfapi uses the Redis Pub/Sub service. Once the lifecycle event is triggered on a server, it publishes the event to a Pub/Sub channel that all servers subscribe to. The cache eviction or updating process is triggered by the Pub/Sub event.

Please refer to <a href="https://github.com/pfapi/pfapi/blob/development/packages/pfapi-plugin">strapi-plugin-pfapi</a> to see how to use the library and how it works.
