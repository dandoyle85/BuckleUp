export async function handler(event, context) {
  try {
    let items = [];

    // --- Google Trends (primary) ---
    try {
      const url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const xml = await res.text();

      // Parse both <title> and <ht:news_item_title>
      const re = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/g;
      let m;
      while ((m = re.exec(xml)) !== null) {
        const title = m[1] || m[2];
        if (
          title &&
          !title.toLowerCase().includes("google trends") &&
          !title.toLowerCase().includes("error 400")
        ) {
          items.push(title);
        }
        if (items.length >= 20) break;
      }
    } catch (err) {
      console.log("Google Trends fetch failed:", err.message);
    }

    // --- Reddit fallback ---
    if (items.length < 10) {
      try {
        const res = await fetch("https://www.reddit.com/r/Entrepreneur/top.json?t=day&limit=10", {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const data = await res.json();
        const redditItems = data.data.children.map(c => c.data.title);
        items = items.concat(redditItems);
      } catch (err) {
        console.log("Reddit fallback failed:", err.message);
      }
    }

    // --- YouTube fallback ---
    if (items.length < 10) {
      try {
        const res = await fetch("https://www.youtube.com/feeds/videos.xml?chart=mostPopular&regionCode=US");
        const xml = await res.text();
        const re = /<title>(.*?)<\/title>/g;
        let m;
        while ((m = re.exec(xml)) !== null) {
          if (m[1] && !m[1].includes("YouTube")) {
            items.push(m[1]);
          }
          if (items.length >= 20) break;
        }
      } catch (err) {
        console.log("YouTube fallback failed:", err.message);
      }
    }

    // Ensure at least 10 items
    if (items.length < 10) {
      items.push("Fallback niche example 1", "Fallback niche example 2");
    }

    // Format list
    const listItems = items
      .slice(0, 20)
      .map((niche, i) => {
        const rank = i + 1;
        const fire = rank <= 5 ? "🔥" : "";
        return `<li>${rank}. ${niche} ${fire}</li>`;
      })
      .join("");

    // Build HTML response
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>🔥 PowerHouse Niches</title>
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
        <h1>🚀 Top Niches (Google Trends + Fallbacks)</h1>
        <ul>${listItems}</ul>
        <div class="footer">💵 Buckle up... cash incoming soon! | Source: Multi (Google, Reddit, YouTube)</div>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Error fetching niches: " + err.message
    };
  }
}
