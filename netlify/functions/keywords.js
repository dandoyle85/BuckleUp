export async function handler(event, context) {
  try {
    const niche = (event.queryStringParameters && event.queryStringParameters.niche) || "";
    if (!niche) {
      return { statusCode: 400, headers: { "Content-Type": "text/plain" }, body: "❌ Missing ?niche= query parameter" };
    }

    let suggestions = [];

    // 1. Google Autocomplete
    try {
      const url = "https://suggestqueries.google.com/complete/search?client=firefox&q=" + encodeURIComponent(niche);
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await res.json();
      if (Array.isArray(data[1])) suggestions = data[1];
    } catch (err) { console.log("Google autocomplete failed:", err.message); }

    // 2. Reddit fallback
    if (suggestions.length < 10) {
      try {
        const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(niche)}&limit=10`);
        const data = await res.json();
        const reddit = data.data.children.map(c => c.data.title);
        suggestions = suggestions.concat(reddit);
      } catch (err) { console.log("Reddit fallback failed:", err.message); }
    }

    // 3. YouTube fallback
    if (suggestions.length < 10) {
      try {
        const url = "https://suggestqueries.google.com/complete/search?ds=yt&client=firefox&q=" + encodeURIComponent(niche);
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const data = await res.json();
        if (Array.isArray(data[1])) suggestions = suggestions.concat(data[1]);
      } catch (err) { console.log("YouTube fallback failed:", err.message); }
    }

    suggestions = [...new Set(suggestions)].slice(0, 20);

    // Scoring with 🔥
    const scored = suggestions.map(s => {
      let score = 0;
      if (s.split(" ").length >= 3) score++;
      if (/(best|software|app|review|top|buy)/i.test(s)) score++;
      return { keyword: s, score: "🔥".repeat(Math.min(5, score)) };
    });

    // Build HTML output
    const listItems = scored.map((k, i) => `<li>${i + 1}. ${k.keyword} <span style="color:#ff6f61">${k.score}</span></li>`).join("");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>🔑 PowerHouse Keywords</title>
        <style>
          body { background:#121212; color:#f5f5f5; font-family:Arial,sans-serif; padding:20px; }
          h1 { color:#00ffcc; }
          ul { list-style:none; padding:0; }
          li { margin:8px 0; font-size:18px; }
          li:nth-child(-n+5) { font-weight:bold; color:#ff6f61; }
          .footer { margin-top:20px; font-size:12px; color:#888; }
        </style>
      </head>
      <body>
        <h1>🔑 Keyword Ideas for: ${niche}</h1>
        <ul>${listItems}</ul>
        <div class="footer">💵 Buckle up... cash incoming soon! | Source: Google, Reddit, YouTube</div>
      </body>
      </html>
    `;

    return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "text/plain" }, body: "Error fetching keywords: " + err.message };
  }
}
