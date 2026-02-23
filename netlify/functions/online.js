let cachedData = null;
let lastFetch = 0; // timestamp in ms

export async function handler(event, context) {
  const now = Date.now();

  // Allowed origins
  const allowedOrigins = [
    "https://linuxfandudeguy.github.io",
    "https://durokotte.foo.ng",
  ];

  const requestOrigin = event.headers.origin;

  if (!allowedOrigins.includes(requestOrigin)) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Access denied" }),
    };
  }

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

  // Only fetch from Lanyard if cache is older than 2 seconds
  if (!cachedData || now - lastFetch > 2000) {
    const DISCORD_ID = "1443022848443551849";
    const API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

    try {
      const res = await fetch(API_URL);
      const json = await res.json();

      if (!json.success) {
        throw new Error("Lanyard API returned an error");
      }

      cachedData = json.data;
      lastFetch = now;
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to fetch Discord presence" }),
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
