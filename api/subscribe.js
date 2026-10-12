// Passes a "Notify me" signup from he-brews.love to MailerLite (form: he-brews.love signup).
// Runs on Vercel's servers, so visitors' ad blockers don't stop the signup.
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
  try {
    const r = await fetch(ML_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "fields[email]": email, "ml-submit": "1", "anticsrf": "true" }).toString(),
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
