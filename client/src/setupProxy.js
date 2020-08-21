const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
    })
  );
};

//현재 react는 호스트는 3000번이지만 proxy타겟을 임의로 5000번으로 줌(node서버와 같도록)
