const fs = require('fs');
const path = require('path');
const Webu = require('./index');
const websico = new Webu();

websico.get('/', (req, res) => {
    // Specify the path to your HTML file
    const htmlFilePath = path.join(__dirname, 'index.html');

    // Read the HTML file
    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

websico.start(3000, (port) => {
    console.log(`Server listening on: ${port}`);
});
