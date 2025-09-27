export async function handler(event, context) {
  try {
    let items = [];

    // --- Google Trends (primary) ---
    try {
      const url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";
      const res = await fetch(url);
      const xml = await res.text();

      // Parse both <title> and <ht:news_item_title>
      const re = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/g;
      let m;
      while ((m = re.exec(xml)) !== null) {
        const title = m[1] || m[2];
        if (title && !title.toLowerCase().includes("google trends")) {
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
        const res = await fetch("https://www.reddit.com/r/Entrepreneur/top.json?t=day&limit=10");
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

    // Ensure at least 10 results
    items = items.slice(0, 20);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "multi",
        count: items.length,
        niches: items
      }, null, 2)
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
