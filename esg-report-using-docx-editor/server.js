/* Minimal static file server for local POC verification only.
 * Usage: node server.js  (then open http://localhost:8080)                 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".sfdt": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

http.createServer(function (req, res) {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") { urlPath = "/index.html"; }
    const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, ""));
    fs.readFile(filePath, function (err, data) {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found: " + urlPath);
            return;
        }
        res.writeHead(200, { "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        res.end(data);
    });
}).listen(PORT, function () {
    console.log("ESG POC served at http://localhost:" + PORT);
});
