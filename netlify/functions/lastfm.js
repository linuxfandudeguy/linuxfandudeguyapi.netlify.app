let cachedData = null;
let lastFetch = 0; // timestamp in ms

export async function handler(event, context) {
  const now = Date.now();
  const allowedOrigin = "https://linuxfandudeguy.github.io";

  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK",
    };
  }

  // Only fetch from Last.fm if cache is older than 5 seconds
  if (!cachedData || now - lastFetch > 5000) {
    const apiKey = process.env.API_KEY; 
    const username = "lelbois";

    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user: username,
      api_key: apiKey,
      format: "json"
    });

    const url = `https://ws.audioscrobbler.com/2.0/?${params.toString()}&limit=1`;

    try {
      const res = await fetch(url);
      cachedData = await res.json(); // Keep full JSON
      lastFetch = now;
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to fetch Last.fm data" }),
      };
    }
  }

  // Return the full cached JSON directly
  return {
    statusCode: 200,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Cache-Control": "max-age=5",
    },
    body: JSON.stringify(cachedData),
  };
}
