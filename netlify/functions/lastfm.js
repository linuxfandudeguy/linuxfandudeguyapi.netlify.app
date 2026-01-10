let cachedData = null;
let lastFetch = 0; // timestamp in ms

export async function handler(event, context) {
  const now = Date.now();

  // List of allowed origins
  const allowedOrigins = [
    "https://linuxfandudeguy.github.io",
    "https://durokotte.foo.ng",
  ];

  // Get the origin from the request
  const requestOrigin = event.headers.origin;

  // If origin is not in allowed list, reject
  if (!allowedOrigins.includes(requestOrigin)) {
    return {
      statusCode: 403, // Forbidden
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Access denied" }),
    };
  }

  // Set CORS headers for allowed origins
  const headers = {
    "Access-Control-Allow-Origin": requestOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK",
    };
  }

  // Only fetch from Last.fm if cache is older than 2 seconds
  if (!cachedData || now - lastFetch > 2000) {
    const apiKey = process.env.API_KEY;
    const username = "lelbois";

    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user: username,
      api_key: apiKey,
      format: "json",
      limit: 1,
    });

    const url = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;

    try {
      const res = await fetch(url);
      cachedData = await res.json();
      lastFetch = now;
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to fetch Last.fm data" }),
      };
    }
  }

  // Return cached data
  return {
    statusCode: 200,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      "Cache-Control": "max-age=2",
    },
    body: JSON.stringify(cachedData),
  };
}
