export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Retrieve the Token and Chat IDs from the Vercel Environment Variables
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  // If we have multiple Chat IDs, we can store them in an env var separated by comma, e.g. '6360151024,2081838085'
  const chatIdsEnv = process.env.TELEGRAM_CHAT_IDS;
  
  if (!botToken || !chatIdsEnv) {
    console.error("Missing Environment Variables on Vercel");
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const chatIds = chatIdsEnv.split(',');

  const { parent_name, phone, email, child_name, child_age, program, home_address, notes } = req.body;

  // Format the time
  const now = new Date();
  const day = now.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeString = `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;

  const messageText = `
🔔 <b>New Application Received!</b> 🔔

🧑‍👦 <b>Child Information:</b>
- Name: ${child_name}
- Age: ${child_age}
- Program: ${program}

👨‍👩‍👧 <b>Parent Information:</b>
- Name: ${parent_name}
- Phone: <code>${phone}</code>
${email ? `- Email: ${email}` : ''}
${home_address ? `- Address: ${home_address}` : ''}

📝 <b>Additional Notes:</b>
${notes ? notes : 'No additional notes provided.'}

🕒 <i>Submitted at: ${timeString}</i>
  `.trim();

  try {
    // Send to all chat IDs
    for (const chatId of chatIds) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: messageText,
          parse_mode: 'HTML'
        })
      });
    }

    res.status(200).json({ success: true, message: 'Telegram notification sent' });
  } catch (error) {
    console.error('Error sending telegram notification:', error);
    res.status(500).json({ success: false, message: 'Error sending to Telegram' });
  }
}
