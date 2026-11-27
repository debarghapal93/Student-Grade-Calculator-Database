const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const calculateHandler = require('./api/calculate');
const recordsHandler = require('./api/records');
const deleteHandler = require('./api/delete');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function createVercelResponseMock(res) {
  res.status = function (statusCode) {
    res.statusCode = statusCode;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
    return res;
  };
  return res;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  let pathname = reqUrl.pathname;

  // Emulate Vercel serverless functions
  req.query = Object.fromEntries(reqUrl.searchParams.entries());

  // Collect body for POST / DELETE
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
  });

  req.on('end', async () => {
    if (rawBody) {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          req.body = JSON.parse(rawBody);
        } catch {
          req.body = rawBody;
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const querystring = require('querystring');
        req.body = querystring.parse(rawBody);
      } else {
        req.body = rawBody;
      }
    } else {
      req.body = {};
    }

    const vercelRes = createVercelResponseMock(res);

    if (pathname === '/api/calculate') {
      return await calculateHandler(req, vercelRes);
    }
    if (pathname === '/api/records') {
      return await recordsHandler(req, vercelRes);
    }
    if (pathname === '/api/delete') {
      return await deleteHandler(req, vercelRes);
    }

    // Static files
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    } else if (pathname === '/results') {
      pathname = '/results.html';
    }

    const filePath = path.join(__dirname, pathname);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('<h1>404 Not Found</h1>');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Local dev server running at http://localhost:${PORT}`);
});
