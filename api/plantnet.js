const https = require('https');

export const config = {
  api: {
    bodyParser: false, // Disables Vercel's default body parsing so we can pipe the raw stream
  },
};

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  // Construct target URL
  const targetPath = req.url.replace(/^\/api\/plantnet/, '');
  const targetUrl = new URL(`https://my-api.plantnet.org${targetPath}`);

  const options = {
    hostname: targetUrl.hostname,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {},
  };

  // Only forward content-type (which contains the multipart boundary)
  if (req.headers['content-type']) {
    options.headers['content-type'] = req.headers['content-type'];
  }
  if (req.headers['content-length']) {
    options.headers['content-length'] = req.headers['content-length'];
  }

  // Use native https.request to ensure NO automatic Origin or Referer headers are added
  const proxyReq = https.request(options, (proxyRes) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(proxyRes.statusCode);
    
    // Forward the response back to the client
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  });

  // Pipe the raw incoming request body to the outgoing request
  req.pipe(proxyReq);
}
