# ioredis-sentinel-hang

To reproduce the hang:

Make sure you have node 14 and docker (with docker-compose) installed.

```
$ npm ci
$ npm start
$ npm test
# The above command should hang. To kill it, Ctrl+C.

# To shut down the other docker containers
$ npm stop
```

