# Hot-reload server, based on server-sent events (SSE)

This repository contains demo of hot-reload server, based on server-sent events (SSE). This show the same approach, which was implemented in [The Error Pages](https://github.com/sapachev/error-pages) tool.

Served files are located in `src` directory and can be edit to see how the hot-reload works. You can edit, add or remove files in this directory.

Before server run, please install required dependencies with `npm install` command.

To run server use `npm run koa-server` command – this will run koa-server with custom middlewares.
