// Simple health check endpoint for Vercel
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      platform: 'Vercel Serverless'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
