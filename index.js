const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class Websico {
  constructor() { 
    this.routes = {
      GET: [],
      PUT: [],
      POST: [],
      DELETE: [],
      PATCH: [],
      HEAD: [],
      OPTIONS: [],
      TRACE: [],
      ERROR: [], // Custom error pages
    };
    this.startMessage = 'Websico server listening on port';
  }

  get(path, handler) {
    this.routes.GET.push({ path, handler });
  }

  put(path, handler) {
    this.routes.PUT.push({ path, handler });
  }

  post(path, handler) {
    this.routes.POST.push({ path, handler });
  }

  delete(path, handler) {
    this.routes.DELETE.push({ path, handler });
  }

  patch(path, handler) {
    this.routes.PATCH.push({ path, handler });
  }

  head(path, handler) {
    this.routes.HEAD.push({ path, handler });
  }

  options(path, handler) {
    this.routes.OPTIONS.push({ path, handler });
  }

  trace(path, handler) {
    this.routes.TRACE.push({ path, handler });
  }

  error(handler) {
    this.routes.ERROR.push({ handler });
  }

  setStartMessage(message) {
    this.startMessage = message;
  }

  // sendFile(res, filePath, contentType = 'text/html') {
  //   fs.readFile(filePath, (err, data) => {
  //     if (err) {
  //       res.writeHead(500, { 'Content-Type': 'text/plain' });
  //       res.end('Internal Server Error');
  //     } else {
  //       console.log(err);
  //       res.writeHead(200, { 'Content-Type': contentType });
  //       res.end(data);
  //     }
  //   });
  // }

  // send(res, statusCode, body, headers = {}) {
  //   if (headers['Content-Type'] === 'text/html' && typeof body === 'string') {
  //     // Treat body as an HTML file path
  //     this.sendFile(res, path.join(__dirname, body), 'text/html');
  //   } else {
  //     res.writeHead(statusCode, { ...headers, 'Content-Type': 'text/plain' });
  //     res.end(body);
  //   }
  // }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);

    const route = this.routes[req.method].find(
      r => r.path === parsedUrl.pathname
    );

    if (route) {
      // Enhance the res object with send method
      res.send = (statusCode, body, headers) =>
        this.send(res, statusCode, body, headers);

      route.handler(req, res);
    } else {
      // Check for custom error page
      const errorPage = this.routes.ERROR.find(e => e.handler);

      if (errorPage) {
        // Enhance the res object with send method
        res.send = (statusCode, body, headers) =>
          this.send(res, statusCode, body, headers);

        errorPage.handler(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    }
  }

  start(port, compFunc) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, () => {
      if (!compFunc) {
        console.log(`${this.startMessage} ${port}`);
      } else {
        compFunc(port);
      }
    });
  }
}

// Export the Websico class as a module
module.exports = Websico;
