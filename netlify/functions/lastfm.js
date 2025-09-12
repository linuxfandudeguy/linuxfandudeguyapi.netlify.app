let cachedData = null;
let lastFetch = 0; // timestamp in ms

export async function handler(event, context) {
  const now = Date.now();

  // Only fetch from Last.fm if cache is older than 5 seconds
  if (!cachedData || now - lastFetch > 5000) {
    const apiKey = process.env.API_KEY; // stored securely in Netlify
    const username = "lelbois";

    // Safely escape parameters
    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user: username,
      api_key: apiKey,
      format: "json"
    });

    const url = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;

    try {
      const res = await fetch(url);
      cachedData = await res.json();
      lastFetch = now;
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch Last.fm data" }),
      };
    }
  }

  // Pick the latest track and include album art if available
  const track = cachedData.recenttracks.track[0];
  const nowPlaying = track["@attr"] && track["@attr"].nowplaying === "true";
  const artist = track.artist["#text"];
  const song = track.name;
  const albumArt = track.image?.[2]["#text"] || ""; // medium size

  const response = {
    nowPlaying,
    artist,
    song,
    albumArt,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "max-age=30", // optional client-side caching
    },
  };
}
