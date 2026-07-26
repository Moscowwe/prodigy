export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const body = req.body;

    // Check if it's a message and contains text
    if (body && body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      if (text === '/start') {
        const welcomeMessage = `
🌟 <b>Welcome to Prodigy Kindergarten Admin Bot!</b> 🌟

I am online and ready to receive new applications from the website.
Whenever a parent registers, I will send you their details immediately.

<i>Just wait for the notifications!</i>
        `.trim();

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'HTML'
          })
        });
      }
    }

    // Always return 200 so Telegram knows we received the update
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
}
