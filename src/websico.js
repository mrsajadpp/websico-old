"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");
var logger = console.log;
var Websico = /** @class */ (function () {
    function Websico() {
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
        this.publicDirectory = ''; // Default public directory
    }
    Websico.prototype.sendFile = function (res, filePath, contentType) {
        if (contentType === void 0) { contentType = 'text/html'; }
        fs.readFile(filePath, function (err, data) {
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
    };
    Websico.prototype.send = function (res, statusCode, body, headers) {
        if (headers === void 0) { headers = {}; }
        if (headers['Content-Type'] && typeof body === 'string') {
            // Treat body as an HTML file path
            res.writeHead(200, { 'Content-Type': headers['Content-Type'] });
            res.end(body);
        }
        else {
            res.writeHead(statusCode, __assign(__assign({}, headers), { 'Content-Type': 'text/plain' }));
            res.end(body);
        }
    };
    Websico.prototype.handleStaticFiles = function (req, res, errorPage) {
        var _this = this;
        // Combine the public directory and requested file path
        var filePath = path.join(this.publicDirectory, req.url || '');
        // Check if the file exists
        fs.exists(filePath, function (exists) {
            if (exists) {
                // Determine the content type based on the file extension
                var contentType = 'text/plain';
                var ext = path.extname(filePath);
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
                _this.sendFile(res, filePath, contentType);
            }
            else {
                if (errorPage) {
                    // Enhance the res object with send method
                    res.send = function (statusCode, body, headers) {
                        _this.send(res, statusCode, body, headers);
                    };
                    errorPage.handler(req, res);
                }
                else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
        });
    };
    Websico.prototype.handleRequest = function (req, res) {
        var _this = this;
        var _a;
        var parsedUrl = url.parse(req.url || '', true);
        var route = (_a = this.routes[req.method]) === null || _a === void 0 ? void 0 : _a.find(function (r) { return r.path === parsedUrl.pathname; });
        // If the public directory doesn't exist or the file is not found, proceed with regular routes
        if (route) {
            // Enhance the res object with send method
            res.send = function (statusCode, body, headers) {
                return _this.send(res, statusCode, body, headers);
            };
            route.handler(req, res);
        }
        else {
            // Check for custom error page
            var errorPage = this.routes.ERROR.find(function (e) { return e.handler; });
            // Check if the public directory exists
            if (this.publicDirectory && fs.existsSync(this.publicDirectory)) {
                // Try to handle static files
                if (req.method === 'GET') {
                    this.handleStaticFiles(req, res, errorPage);
                }
            }
            else {
                if (errorPage) {
                    // Enhance the res object with send method
                    res.send = function (statusCode, body, headers) {
                        _this.send(res, statusCode, body, headers);
                    };
                    errorPage.handler(req, res);
                }
                else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
        }
    };
    Websico.prototype.get = function (path, handler) {
        this.routes.GET.push({ path: path, handler: handler });
    };
    Websico.prototype.put = function (path, handler) {
        this.routes.PUT.push({ path: path, handler: handler });
    };
    Websico.prototype.post = function (path, handler) {
        this.routes.POST.push({ path: path, handler: handler });
    };
    Websico.prototype.delete = function (path, handler) {
        this.routes.DELETE.push({ path: path, handler: handler });
    };
    Websico.prototype.patch = function (path, handler) {
        this.routes.PATCH.push({ path: path, handler: handler });
    };
    Websico.prototype.head = function (path, handler) {
        this.routes.HEAD.push({ path: path, handler: handler });
    };
    Websico.prototype.options = function (path, handler) {
        this.routes.OPTIONS.push({ path: path, handler: handler });
    };
    Websico.prototype.trace = function (path, handler) {
        this.routes.TRACE.push({ path: path, handler: handler });
    };
    Websico.prototype.error = function (handler) {
        this.routes.ERROR.push({ handler: handler });
    };
    Websico.prototype.setPublicDirectory = function (directory, fileName) {
        logger("".concat(directory, "/").concat(fileName));
        this.publicDirectory = "".concat(directory, "/").concat(fileName);
    };
    Websico.prototype.start = function (port, compFunc) {
        var _this = this;
        var server = http.createServer(function (req, res) {
            // Enhance the res object with send method
            res.send = function (statusCode, body, headers) {
                return _this.send(res, statusCode, body, headers);
            };
            _this.handleRequest(req, res);
        });
        server.listen(port, function () {
            if (compFunc) {
                compFunc(port);
            }
        });
    };
    return Websico;
}());
module.exports = Websico;
