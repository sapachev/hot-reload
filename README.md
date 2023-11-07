# Hot-reload server, based on server-sent events (SSE)

This repository contains demo of hot-reload server, based on server-sent events (SSE). This demo show the same approach, which was implemented in [The Error Pages](https://github.com/sapachev/error-pages) tool.

Here you can find the hot-reload examples under [Express](https://expressjs.com/) and [Koa](https://koajs.com/) servers.

Served files are located in `src` directory and can be edited to see how the hot-reload works. You can edit, add or remove files in this directory.

Before server run, please install required dependencies with `npm install` command.

## Express

Use `npm run express-server` command to run express-server with custom middlewares.

## Koa

Use `npm run koa-server` command to run koa-server with custom middlewares.
