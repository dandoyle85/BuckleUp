export async function handler(event, context) {
  try {
    const url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";
    const res = await fetch(url);
    const xml = await res.text();
    const items = [];
    const re = /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      if (m[1]) items.push(m[1]);
      if (items.length >= 20) break;
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "google_trends_daily_us", count: items.length, niches: items }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
