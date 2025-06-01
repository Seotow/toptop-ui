const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://tiktok.fullstack.edu.vn',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/api': '/api', // Remove /api prefix when forwarding to target
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add any custom headers if needed
        console.log('Proxying request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
      },
    })
  );
};
