import chokidar from "chokidar";
import bodyParser from "body-parser";
import express, { Express } from "express";
import { readFileSync } from "fs";

import { SERVER_PORT, WATCH_DIRECTORY } from "./constants";

// Put index-file content to the body request
function readIndex(req, _, next) {
  try {
    req.body = readFileSync(`${WATCH_DIRECTORY}/index.html`).toString();
    next();
  } catch (err) {
    next(err.message);
  }
}

// Add template variable to the index-file content
function injectVariable(req, res, next) {
  if (req.body) {
    req.body = req.body.replace(/<\/(body)>/gi, "%$1-injection%</$1>");
    next();
  } else {
    res.status(204).end();
  }
}

// Inject client-side code to enable sse-listening
function injectSse(req, res, next) {
  if (req.body) {
    try {
      const sseInjection = readFileSync("./sse-injection.html").toString();
      req.body = req.body.replace("%body-injection%", sseInjection);
      next();
    } catch (err) {
      next(err.message);
    }
  } else {
    res.status(204).end();
  }
}

// Directory watcher setup
const watcher = chokidar.watch(`${WATCH_DIRECTORY}/**`, {
  persistent: true,
  interval: 300,
});

// Server setup
const app: Express = express();

// Root
app.get('/', bodyParser.text(), readIndex, injectVariable, injectSse, (req, res) => {
  res.send(req.body);
});

// Hot-reload feature over Server-sent events (SSE)
app.get('/events', (req, res, next) => {
  try {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    res.write(`data: init\n\n`);

    const sseHandler = (path) => {
      res.write(`data: reload\n\n`);
      console.log(`hot-reload on ${path}`);
    };

    watcher.on("add", sseHandler).on("change", sseHandler).on("unlink", sseHandler).on("addDir", sseHandler).on("unlinkDir", sseHandler);

    req.on('close', () => {
      res.end('ok');
    });
  } catch (err) {
    next(err.message);
  }
});

// Static serve
app.use(express.static(WATCH_DIRECTORY));

app.listen(SERVER_PORT, () => console.log(`hot-reload server was started on port ${SERVER_PORT}`));
