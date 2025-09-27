export async function handler(event, context) {
  try {
    const url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";
    const res = await fetch(url);
    const xml = await res.text();
    const items = [];

    // Match both <title><![CDATA[...]]> and <ht:news_item_title><![CDATA[...]]>
    const re = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/g;

    let m;
    while ((m = re.exec(xml)) !== null) {
      const title = m[1] || m[2];
      if (title) items.push(title);
      if (items.length >= 20) break;
    }

    // Build HTML list with emojis
    const listItems = items
      .map((niche, i) => {
        const rank = i + 1;
        const fire = rank <= 5 ? "🔥" : "";
        return `<li>${rank}. ${niche} ${fire}</li>`;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>🔥 PowerHouse Niches</title>
        <style>
          body { background:#121212; color:#f5f5f5; font-family:Arial, sans-serif; padding:20px; }
          h1 { color:#00ffcc; }
          ul { list-style:none; padding:0; }
          li { margin:8px 0; font-size:18px; }
          li:nth-child(-n+5) { font-weight:bold; color:#ff6f61; }
          .footer { margin-top:20px; font-size:12px; color:#888; }
        </style>
      </head>
      <body>
        <h1>🚀 Top 20 Google Trends Niches</h1>
        <ul>${listItems}</ul>
        <div class="footer">💵 Buckle up... cash incoming soon! | Source: Google Trends US</div>
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
      body: "Error fetching trends: " + err.message
    };
  }
}
