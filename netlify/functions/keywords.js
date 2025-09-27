export async function handler(event, context) {
  try {
    const niche = (event.queryStringParameters && event.queryStringParameters.niche) || "";
    if (!niche) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing ?niche= query parameter" }) };
    }
    const url = "https://suggestqueries.google.com/complete/search?client=firefox&q=" + encodeURIComponent(niche);
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    const suggestions = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ niche, suggestions }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
