import chokidar from "chokidar";
import { readFileSync } from "fs";
import Koa from "koa";
import mime from "mime-types";
import Stream from "stream";

import { SERVER_PORT, WATCH_DIRECTORY } from "./constants";
import { getAllFiles } from "./common";

// Server setup
const app = new Koa();

const watcher = chokidar.watch(`${WATCH_DIRECTORY}/**`, {
  persistent: true,
  interval: 300,
});

// Hot-reload feature over Server-sent events (SSE)
app.use((ctx, next) => {
  console.log(`requested ${ctx.path}`);
  if ("/events" == ctx.path) {
    ctx.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    ctx.status = 200;

    const stream = new Stream.PassThrough();
    ctx.body = stream;

    stream.write(`data: init\n\n`);

    const sseHandler = (path) => {
      stream.write(`data: reload\n\n`);
      console.log(`hot-reload on ${path}`);
    };

    watcher.on("add", sseHandler).on("change", sseHandler).on("unlink", sseHandler).on("addDir", sseHandler).on("unlinkDir", sseHandler);

    ctx.req.on("close", () => {
      stream.end();
    });
  } else {
    ctx.set({
      Connection: 'close',
    });
    return next();
  }
});

// Root URL processor and static serve
app.use((ctx, next) => {
  const files = getAllFiles(WATCH_DIRECTORY);

  if (ctx.path === "/" || ctx.path === "/index.html") {
    ctx.body = readFileSync(`${WATCH_DIRECTORY}/index.html`).toString();
    next();
  } else if (files.includes(ctx.path)) {
    const path = `${WATCH_DIRECTORY}${ctx.path}`;
    ctx.body = readFileSync(path);
    ctx.type = mime.lookup();
  }
  else {
    ctx.redirect('/');
  }
});

// Inject template variable
app.use((ctx, next) => {
  if (ctx.body) {
    ctx.body = ctx.body.replace(/<\/(body)>/gi, "%$1-injection%</$1>");
    next();
  } else {
    ctx.status = 204;
  }
});

// Inject sse-template to the body
app.use((ctx, next) => {
  if (ctx.body) {
    try {
      const sseInjection = readFileSync("./sse-injection.html").toString();

      ctx.body = ctx.body.replace("%body-injection%", sseInjection);

      next();
    } catch (err) {
      ctx.status = 500;
      ctx.body = err.message;
    }
  } else {
    ctx.status = 204;
  }
});

app.listen(SERVER_PORT);
console.log(`hot-reload server was started on port ${SERVER_PORT}`);
