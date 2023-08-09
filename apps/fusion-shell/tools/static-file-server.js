var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var { createProxyMiddleware } = require('http-proxy-middleware');

var { generateMiddlewares } = require('./scripts/proxy-config-utils');
var { generateCSPHeader } = require('./scripts/lib/http-headers-utils');

var app = express();

/**
 * NodeJS static files server that will allow cdf-hub to be served locally
 * This is an experiment, later probably it will be removed
 */
var port = process.argv[2] || 8080;
var useSSL = process.argv[3] === 'true';
var appBuildMode = process.argv[4] || 'cdf';
var configuration = (process.argv[5] || 'staging').replace('fusion-', '');
var organizationName = process.argv[6] || 'cog-appdev';

var rootPath = path.resolve(__dirname, '../../../');
var basePath = appBuildMode === 'cdf' ? '/cdf/' : '/';

// For serving static files is the opposite case
// for cdf, we are providing /cdf in the path, for fusion, we are serving from root
var staticFilesLookupFolder = appBuildMode === 'cdf' ? '' : '/cdf';

// We need the correct import map manifest folder for the sub-apps so we can generate the proxy config
var importMapEnv = configuration || 'staging';

const subAppsConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../src/apps-manifest.json'), 'utf8')
);

app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy',
    generateCSPHeader(subAppsConfig, importMapEnv)
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Proxy _api/login_info calls to domain config service
// we need to figure this out
app.use(
  '/_api/login_info',
  createProxyMiddleware({
    target: 'https://app-login-configuration-lookup.cognite.ai/fusion-dev/',
    secure: false,
    changeOrigin: true,
    logLevel: 'error',
    pathRewrite: function (path, req) {
      var organization = req.headers['host'].match(/[\w\-]+.fusion/)
        ? req.headers['host'].split('.')[0]
        : organizationName;
      return path.replace('/_api/login_info', '') + organization;
    },
  })
);

// After build, serve the static files from following dirs
app.use(
  express.static(
    rootPath + '/dist/apps/fusion-shell' + staticFilesLookupFolder,
    {
      extensions: ['js', 'css', 'json', 'ico', 'html'],
    }
  )
);

// Load fusion from following paths
app.use(
  '/',
  express.static(rootPath + '/dist/apps/fusion-shell' + staticFilesLookupFolder)
);

// Load fusion also when /cdf/ is used with unified signin
app.use(
  basePath + ':tenant/:subApp?',
  express.static(rootPath + '/dist/apps/fusion-shell/cdf')
);

if (configuration === 'mock') {
  generateMiddlewares(app);
}

var server = useSSL
  ? https.createServer(
      {
        key: fs.readFileSync(__dirname + '/cert/server.key'),
        cert: fs.readFileSync(__dirname + '/cert/server.crt'),
      },
      app
    )
  : http.createServer(app);

server.listen(port, function () {
  console.log('Express server listening on port ' + port);
  console.log(
    (useSSL ? 'https://localhost:' + port : 'http://localhost:' + port) +
      basePath +
      'platypus?cluster=greenfield.cognitedata.com&organization=' +
      organizationName
  );
});
