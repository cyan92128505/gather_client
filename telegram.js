async function sendTelegram(text, { silent = false } = {}) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    console.error("telegram config missing (TG_BOT_TOKEN / TG_CHAT_ID)");
    return;
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_notification: silent,
      }),
    });
    if (!res.ok) {
      console.error("telegram send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("telegram send error:", err);
  }
}

module.exports = { sendTelegram };
