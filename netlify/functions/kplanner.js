import { GoogleAdsApi } from "google-ads-api";

export async function handler(event, context) {
  try {
    const params = event.queryStringParameters;
    const keyword = params.keyword || "drone business";

    // Auth using Netlify env vars
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_account_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Run Keyword Ideas search
    const keywordIdeas = await customer.keywordPlanIdeas.generateKeywordIdeas({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      keywords: [keyword],
      geo_target_constants: ["geoTargetConstants/2840"], // United States
      language: "languageConstants/1000", // English
      include_adult_keywords: false,
    });

    // Format results
    const results = keywordIdeas.map(k => ({
      text: k.text,
      avg_monthly_searches: k.keyword_idea_metrics?.avg_monthly_searches || 0,
      competition: k.keyword_idea_metrics?.competition || "UNKNOWN",
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: keyword,
        count: results.length,
        keywords: results.slice(0, 20) // limit to 20
      }),
    };

  } catch (err) {
    console.error("Keyword Planner error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}