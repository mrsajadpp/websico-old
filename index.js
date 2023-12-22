const http = require('http');
const url = require('url');

class Webu {
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
    this.startMessage = 'Terrain server listening on port';
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

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);

    const route = this.routes[req.method].find(
      r => r.path === parsedUrl.pathname
    );

    if (route) {
      route.handler(req, res);
    } else {
      // Check for custom error page
      const errorPage = this.routes.ERROR.find(e => e.handler);

      if (errorPage) {
        errorPage.handler(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    }
  }

  start(port) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, () => {
      console.log(`${this.startMessage} ${port}`);
    });
  }
}

// // Example usage
// const terrain = new Terrain();

// terrain.get('/', (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('GET request to /');
// });

// terrain.error((req, res) => {
//   res.writeHead(404, { 'Content-Type': 'text/html' });
//   res.end('<h1>Custom 404 Error Page</h1>');
// });

// // Set custom start message
// // terrain.setStartMessage('Custom message:');

// terrain.start(3000);

module.exports = Webu;
