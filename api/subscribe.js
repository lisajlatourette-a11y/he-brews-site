// Passes a "Notify me" signup from he-brews.love to MailerLite (form: he-brews.love signup).
// Runs on Vercel's servers, so visitors' ad blockers don't stop the signup.
const SONGS = ["Our Father Flame","More Is Coming","Great Servants","Threshold of Your Light","Bring Yourself Home","Lay Down Your Blade","Our Daily Bread","Step Into the Sunlight","Pray First"];
const ML_URL = "https://assets.mailerlite.com/jsonp/2706957/forms/201151474732894010/subscribe";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false });
  }
  let body = req.body || {};
  if (typeof body === "string") {
    body = Object.fromEntries(new URLSearchParams(body));
  }
  const email = String(body.email || body["fields[email]"] || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, error: "invalid_email" });
  }
  const song = String(body.song || "").trim();
  const fields = { "fields[email]": email, "ml-submit": "1", "anticsrf": "true" };
  if (SONGS.includes(song)) fields["fields[favorite_song]"] = song;
  try {
    const r = await fetch(ML_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields).toString(),
    });
    const text = await r.text();
    let data = {};
    try { data = JSON.parse(text); } catch (e) {}
    const ok = r.ok && data.success !== false;
    return res.status(ok ? 200 : 502).json({ success: ok });
  } catch (e) {
    return res.status(502).json({ success: false });
  }
};
