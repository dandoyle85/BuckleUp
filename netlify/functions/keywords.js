export async function handler(event, context) {
  try {
    const niche = (event.queryStringParameters && event.queryStringParameters.niche) || "";
    if (!niche) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing ?niche= query parameter" })
      };
    }

    let suggestions = [];

    // --- Google Autocomplete ---
    try {
      const url = "https://suggestqueries.google.com/complete/search?client=firefox&q=" + encodeURIComponent(niche);
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await res.json();
      if (Array.isArray(data[1])) suggestions = data[1];
    } catch (err) {
      console.log("Google autocomplete failed:", err.message);
    }

    // --- Reddit fallback ---
    if (suggestions.length < 10) {
      try {
        const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(niche)}&limit=10`);
        const data = await res.json();
        const reddit = data.data.children.map(c => c.data.title);
        suggestions = suggestions.concat(reddit);
      } catch (err) {
        console.log("Reddit fallback failed:", err.message);
      }
    }

    // --- YouTube fallback ---
    if (suggestions.length < 10) {
      try {
        const url = "https://suggestqueries.google.com/complete/search?ds=yt&client=firefox&q=" + encodeURIComponent(niche);
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const data = await res.json();
        if (Array.isArray(data[1])) suggestions = suggestions.concat(data[1]);
      } catch (err) {
        console.log("YouTube fallback failed:", err.message);
      }
    }

    // Deduplicate + limit
    suggestions = [...new Set(suggestions)].slice(0, 20);

    // 🔥 Scoring
    const scored = suggestions.map(s => {
      let score = 0;
      if (s.split(" ").length >= 3) score++;
      if (/(best|software|app|review|top|buy)/i.test(s)) score++;
      return { keyword: s, score: "🔥".repeat(Math.min(5, score)) || "🔥" };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        niche,
        count: scored.length,
        keywords: scored
      }, null, 2)
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
