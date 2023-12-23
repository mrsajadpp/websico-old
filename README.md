# Websico

<img src="https://thintry.com/wp-content/uploads/2023/12/webu.jslogo.png" alt="Websico by Thintry" width="200">

[![GitHub license](https://img.shields.io/github/license/mrsajadpp/websico.svg)](https://github.com/mrsajadpp/websico/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/mrsajadpp/websico.svg)](https://github.com/mrsajadpp/websico/issues)
[![GitHub stars](https://img.shields.io/github/stars/mrsajadpp/websico.svg)](https://github.com/mrsajadpp/websico/stargazers)

A web server framework for Node.js.

## Installation

```bash
npm install websico
```

## Usage

```javascript
const fs = require('fs');
const path = require('path');
const Websico = require('websico');

const websico = new Websico();

// Setting public directory
websico.setPublicDirectory(__dirname + '/public');

// Handling GET requests
websico.get('/', (req, res) => {
  res.send(200, '<h1>Hello, World!</h1>', { 'Content-Type': 'text/html' });
});

// Handling PUT requests
websico.put('/update', (req, res) => {
  res.send(200, 'Resource updated successfully!');
});

// Handling files
websico.get('/file', (req, res) => {
    // Specify the path to your HTML file
    const htmlFilePath = path.join(__dirname, 'index.html');

    // Read the HTML file
    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

// Setting a custom error page for 404 errors
websico.error((req, res) => {
  res.send(404, '<h1>Custom 404 Error Page</h1>', { 'Content-Type': 'text/html' });
});

// Setting a custom error page for 404 errors (file)
// websico.error((req, res) => {
//     // Specify the path to your HTML file
//     const htmlFilePath = path.join(__dirname, 'view/error.html');

//     // Read the HTML file
//     fs.readFile(htmlFilePath, 'utf8', (err, data) => {
//         res.send(404, data, { 'Content-Type': 'text/html' });
//         // res.end(data);
//     });
// })

// Starting the server on port 3000
websico.start(3000, (port) => {
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

Websico allows you to handle various HTTP methods such as GET, PUT, POST, DELETE, PATCH, HEAD, OPTIONS, and TRACE.

```javascript
websico.get('/', (req, res) => {
  // Handle GET request for '/'
});

websico.put('/update', (req, res) => {
  // Handle PUT request for '/update'
});

// Similarly, you can use post, delete, patch, head, options, and trace methods
```

### Custom Error Pages

Set custom error pages to handle specific HTTP status codes. In this example, a custom 404 error page is set.

```javascript
websico.error((req, res) => {
  res.send(404, '<h1>Custom 404 Error Page</h1>', { 'Content-Type': 'text/html' });
});
```

## Contributing

Feel free to contribute by opening issues or submitting pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the [LICENSE](LICENSE) file for details.

<b>Technical Support by https://thintry.com/</b>

<img src="https://thintry.com/wp-content/uploads/2023/12/nobnr2-1.png" alt="Thintry Logo" width="400">
