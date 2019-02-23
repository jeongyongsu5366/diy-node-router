const http = require('http');
const Route = require('route-parser');

const router = (() => {
  const routes = [];

  const addRoute = (method, route, handler) => {
    routes.push({ method, url: new Route(route), handler });
  };

  const findRoute = (method, url) => {
    const route = routes.find(route => {
      return route.method === method && route.url.match(url);
    });

    if (!route) return null;

    return { route, params: route.url.match(url) };
  };

  const get = (route, handler) => addRoute('get', route, handler);
  const post = (route, handler) => addRoute('post', route, handler);

  const router = () => {
    const listen = async port => {
      return http
        .createServer(async (req, res) => {
          const method = req.method.toLowerCase();
          const url = req.url.toLowerCase();
          const found = findRoute(method, url);

          if (found) {
            req.params = found.params;
            res.send = content => {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              res.end(content);
            };

            return found.route.handler(req, res);
          }

          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Route not found.');
        })
        .listen(port);
    };

    return {
      get,
      post,
      listen
    };
  };

  return router;
})();

module.exports = router;
