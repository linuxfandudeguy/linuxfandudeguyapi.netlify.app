export async function handler(event, context) {
  const allowedOrigins = [
    "https://linuxfandudeguy.github.io",
    "https://durokotte.foo.ng",
  ];

  const requestOrigin = event.headers.origin;

  // CORS check
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

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK",
    };
  }

  // Fetch directly from Lanyard API
  try {
    const DISCORD_ID = "1443022848443551849";
    const API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

    const res = await fetch(API_URL);
    const rawJson = await res.json(); // no filtering, raw response

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rawJson), // completely raw JSON
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch Discord presence" }),
    };
  }
}
