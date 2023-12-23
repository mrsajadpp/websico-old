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
    this.publicDirectory = ''; // Default public directory
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

  setPublicDirectory(directory) {
    this.publicDirectory = directory;
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

  sendFile(res, filePath, contentType = 'text/html') {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }

  send(res, statusCode, body, headers = {}) {
    if (headers['Content-Type'] && typeof body === 'string') {
      // Treat body as an HTML file path
      res.writeHead(200, { 'Content-Type': headers['Content-Type'] });
      res.end(body);
    } else {
      res.writeHead(statusCode, { ...headers, 'Content-Type': 'text/plain' });
      res.end(body);
    }
  }


  handleStaticFiles(req, res, errorPage) {
    // Combine the public directory and requested file path
    const filePath = path.join(this.publicDirectory, req.url);


    // Check if the file exists
    fs.exists(filePath, (exists) => {
      if (exists) {
        // Determine the content type based on the file extension
        let contentType = 'text/plain';
        const ext = path.extname(filePath);
        if (ext === '.html') contentType = 'text/html';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.mp4') contentType = 'video/mp4';

        // Read the file and stream it to the response
        this.sendFile(res, filePath, contentType);
      } else {
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
    });
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const route = this.routes[req.method].find(
      (r) => r.path === parsedUrl.pathname
    );

    // If the public directory doesn't exist or the file is not found, proceed with regular routes
    if (route) {
      // Enhance the res object with send method
      res.send = (statusCode, body, headers) =>
        this.send(res, statusCode, body, headers);

      route.handler(req, res);
    } else {

      // Check for custom error page
      const errorPage = this.routes.ERROR.find((e) => e.handler);

      // Check if the public directory exists
      if (this.publicDirectory && fs.existsSync(this.publicDirectory)) {
        // Try to handle static files
        if (req.method === 'GET') {
          if (this.handleStaticFiles(req, res, errorPage)) {
            return; // Static file handled, exit the function
          }
        }
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
