const fs = require('fs');
const path = require('path');
const Websico = require('./src/websico');
const websico = new Websico();


websico.setPublicDirectory(__dirname, 'public'); 

websico.get('/', (req, res) => { 
    // Specify the path to your HTML file
    const htmlFilePath = path.join(__dirname, 'view/index.html');

    // Read the HTML file
    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    }); 
});

websico.error((req, res) => {
    // Specify the path to your HTML file
    const htmlFilePath = path.join(__dirname, 'view/error.html');

    // Read the HTML file 
    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        res.send(404, data, { 'Content-Type': 'text/html' });
        // res.end(data);
    });
})

websico.start(3001, (port) => {
    console.log(`Server listening on: ${port}`);
});
