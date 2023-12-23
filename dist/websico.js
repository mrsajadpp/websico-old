"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url = __importStar(require("url"));
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
    sendFile(res, filePath, contentType = 'text/html') {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
            else {
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
        }
        else {
            res.writeHead(statusCode, Object.assign(Object.assign({}, headers), { 'Content-Type': 'text/plain' }));
            res.end(body);
        }
    }
    handleStaticFiles(req, res, errorPage) {
        // Combine the public directory and requested file path
        const filePath = path.join(this.publicDirectory, req.url || '');
        // Check if the file exists
        fs.exists(filePath, (exists) => {
            if (exists) {
                // Determine the content type based on the file extension
                let contentType = 'text/plain';
                const ext = path.extname(filePath);
                if (ext === '.html')
                    contentType = 'text/html';
                else if (ext === '.css')
                    contentType = 'text/css';
                else if (ext === '.js')
                    contentType = 'application/javascript';
                else if (ext === '.png')
                    contentType = 'image/png';
                else if (ext === '.jpg' || ext === '.jpeg')
                    contentType = 'image/jpeg';
                else if (ext === '.gif')
                    contentType = 'image/gif';
                else if (ext === '.mp4')
                    contentType = 'video/mp4';
                // Read the file and stream it to the response
                this.sendFile(res, filePath, contentType);
            }
            else {
                if (errorPage) {
                    // Enhance the res object with send method
                    res.send = (statusCode, body, headers) => {
                        this.send(res, statusCode, body, headers);
                    };
                    errorPage.handler(req, res);
                }
                else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
        });
    }
    handleRequest(req, res) {
        var _a;
        const parsedUrl = url.parse(req.url || '', true);
        const route = (_a = this.routes[req.method]) === null || _a === void 0 ? void 0 : _a.find((r) => r.path === parsedUrl.pathname);
        // If the public directory doesn't exist or the file is not found, proceed with regular routes
        if (route) {
            // Enhance the res object with send method
            res.send = (statusCode, body, headers) => this.send(res, statusCode, body, headers);
            route.handler(req, res);
        }
        else {
            // Check for custom error page
            const errorPage = this.routes.ERROR.find((e) => e.handler);
            // Check if the public directory exists
            if (this.publicDirectory && fs.existsSync(this.publicDirectory)) {
                // Try to handle static files
                if (req.method === 'GET') {
                    this.handleStaticFiles(req, res, errorPage);
                }
            }
        }
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
    error(path, handler) {
        this.routes.ERROR.push({ path, handler });
    }
    setStartMessage(message) {
        this.startMessage = message;
    }
    setPublicDirectory(directory) {
        this.publicDirectory = directory;
    }
    start(port, compFunc) {
        const server = http.createServer((req, res) => {
            // Enhance the res object with send method
            res.send = (statusCode, body, headers) => this.send(res, statusCode, body, headers);
            this.handleRequest(req, res);
        });
        server.listen(port, () => {
            if (!compFunc) {
                console.log(`${this.startMessage} ${port}`);
            }
            else {
                compFunc(port);
            }
        });
    }
}
module.exports = Websico;
