// Ultra-simple test endpoint
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return res.status(200).json({ 
    message: 'Vercel is working!',
    time: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
};
