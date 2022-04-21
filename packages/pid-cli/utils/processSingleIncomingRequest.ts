import http from 'http';

import isString from 'lodash/isString';

const processSingleIncomingRequest = (): Promise<{ code: string }> =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const fullUrl = `${req.headers.host}${req.url}`;

      if (!req.url.startsWith('/?')) {
        console.debug('Skipped request with url ', req.url);
        res.end();
        return;
      }

      const query = new URL(fullUrl).searchParams;

      const code = query.get('code');
      if (!isString(code)) {
        console.log('query', query);
        throw new Error(`Invalid query code`);
      }

      console.log('Received redirect, shutting down server.');
      res.end('OK!');
      server.close();
      resolve({ code });
    });

    console.log('Listening for redirect on localhost:53000');
    server.listen(53000);
  });

export default processSingleIncomingRequest;
