# Webu.js

[![GitHub license](https://img.shields.io/github/license/mrsajadpp/webu.svg)](https://github.com/mrsajadpp/webu/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/mrsajadpp/webu.svg)](https://github.com/mrsajadpp/webu/issues)
[![GitHub stars](https://img.shields.io/github/stars/mrsajadpp/webu.svg)](https://github.com/mrsajadpp/webu/stargazers)

A web server framework for Node.js.

## Installation

```bash
npm install webu.js
```

## Usage

```javascript
const fs = require('fs');
const path = require('path');
const Webu = require('webu.js');

const webu = new Webu();

// Handling GET requests
webu.get('/', (req, res) => {
  res.send(200, '<h1>Hello, World!</h1>', { 'Content-Type': 'text/html' });
});

// Handling PUT requests
webu.put('/update', (req, res) => {
  res.send(200, 'Resource updated successfully!');
});

// Handling files
webu.get('/file', (req, res) => {
    // Specify the path to your HTML file
    const htmlFilePath = path.join(__dirname, 'index.html');

    // Read the HTML file
    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

// Setting a custom error page for 404 errors
webu.error((req, res) => {
  res.send(404, '<h1>Custom 404 Error Page</h1>', { 'Content-Type': 'text/html' });
});

// Starting the server on port 3000
webu.start(3000, (port) => {
    console.log(`Server listening on: ${port}`);
});
```

## Features

- Simple and lightweight web server framework.
- Support for handling different HTTP methods, including GET and PUT.
- Easily set custom error pages for specific status codes.
- Customize the start message for the server.

## Documentation

### Handling HTTP Methods

Webu.js allows you to handle various HTTP methods such as GET, PUT, POST, DELETE, PATCH, HEAD, OPTIONS, and TRACE.

```javascript
webu.get('/', (req, res) => {
  // Handle GET request for '/'
});

webu.put('/update', (req, res) => {
  // Handle PUT request for '/update'
});

// Similarly, you can use post, delete, patch, head, options, and trace methods
```

### Custom Error Pages

Set custom error pages to handle specific HTTP status codes. In this example, a custom 404 error page is set.

```javascript
webu.error((req, res) => {
  res.send(404, '<h1>Custom 404 Error Page</h1>', { 'Content-Type': 'text/html' });
});
```

## Contributing

Feel free to contribute by opening issues or submitting pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC) - see the [LICENSE](LICENSE) file for details.