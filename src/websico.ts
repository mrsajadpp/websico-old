import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { Buffer } from 'buffer';
const logger = console.log;

interface CustomServerResponse extends http.ServerResponse {
    send: (
        statusCode: number,
        body: string | Buffer,
        headers: Record<string, string>
    ) => void;
}

interface Route {
    path: string;
    handler: (req: http.IncomingMessage, res: CustomServerResponse) => void;
}

interface ErrorRoute {
    path?: string;
    handler: (req: http.IncomingMessage, res: CustomServerResponse) => void;
}

interface Routes {
    GET: Route[];
    PUT: Route[];
    POST: Route[];
    DELETE: Route[];
    PATCH: Route[];
    HEAD: Route[];
    OPTIONS: Route[];
    TRACE: Route[];
    ERROR: ErrorRoute[];
}

class Websico {
    private routes: Routes;
    private publicDirectory: string;

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
        this.publicDirectory = ''; // Default public directory
    }

    private sendFile(
        res: CustomServerResponse,
        filePath: string,
        contentType: string = 'text/html'
    ): void {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }

    private send(
        res: http.ServerResponse & { send?: Function },
        statusCode: number,
        body: string | Buffer,
        headers: Record<string, string> = {}
    ): void {
        if (headers['Content-Type'] && typeof body === 'string') {
            // Treat body as an HTML file path
            res.writeHead(200, { 'Content-Type': headers['Content-Type'] });
            res.end(body);
        } else {
            res.writeHead(statusCode, { ...headers, 'Content-Type': 'text/plain' });
            res.end(body);
        }
    }



    private handleStaticFiles(
        req: http.IncomingMessage,
        res: CustomServerResponse,
        errorPage: ErrorRoute | undefined
    ): void {
        // Combine the public directory and requested file path
        const filePath = path.join(this.publicDirectory, req.url || '');

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
                    res.send = (statusCode, body, headers) => {
                        this.send(res, statusCode, body, headers);
                    }

                    errorPage.handler(req, res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
        });
    }

    private handleRequest(req: http.IncomingMessage, res: CustomServerResponse): void {
        const parsedUrl = url.parse(req.url || '', true);
        const route = this.routes[req.method as keyof Routes]?.find(
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
                    this.handleStaticFiles(req, res, errorPage);
                }
            } else {
                if (errorPage) {
                    // Enhance the res object with send method
                    res.send = (statusCode, body, headers) => {
                        this.send(res, statusCode, body, headers);
                    }

                    errorPage.handler(req, res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            }
        }
    }

    public get(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.GET.push({ path, handler });
    }

    public put(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.PUT.push({ path, handler });
    }

    public post(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.POST.push({ path, handler });
    }

    public delete(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.DELETE.push({ path, handler });
    }

    public patch(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.PATCH.push({ path, handler });
    }

    public head(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.HEAD.push({ path, handler });
    }

    public options(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.OPTIONS.push({ path, handler });
    }

    public trace(path: string, handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.TRACE.push({ path, handler });
    }

    public error(handler: (req: http.IncomingMessage, res: CustomServerResponse) => void): void {
        this.routes.ERROR.push({ handler });
    }

    public setPublicDirectory(directory: string, fileName: string): void {
        logger(`${directory}/${fileName}`);
        this.publicDirectory = `${directory}/${fileName}`;
    }

    public start(port: number, compFunc?: (port: number) => void): void {
        const server = http.createServer((req, res) => {
            // Enhance the res object with send method
            (res as CustomServerResponse).send = (statusCode, body, headers) =>
                this.send(res, statusCode, body, headers);

            this.handleRequest(req, res as CustomServerResponse);
        });

        server.listen(port, () => {
            if (compFunc) {
                compFunc(port);
            }
        });
    }
}

// Export the Websico class as a module
export = Websico;
