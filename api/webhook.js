export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIdsEnv = process.env.TELEGRAM_CHAT_IDS;
    const allowedChatIds = chatIdsEnv ? chatIdsEnv.split(',').map(id => id.trim()) : [];
    const body = req.body;

    let currentChatId = null;
    if (body && body.callback_query) {
      currentChatId = body.callback_query.message.chat.id;
    } else if (body && body.message) {
      currentChatId = body.message.chat.id;
    }

    if (currentChatId && allowedChatIds.length > 0 && !allowedChatIds.includes(currentChatId.toString())) {
      return res.status(200).json({ success: true, message: 'Unauthorized chat ID' });
    }

    if (body && body.callback_query) {
      const query = body.callback_query;
      const data = query.data;
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;

      if (data.startsWith('del_')) {
        const id = data.split('_')[1];
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Yes, Delete', callback_data: `confdel_${id}` },
                  { text: '❌ Cancel', callback_data: `cancel_${id}` }
                ]
              ]
            }
          })
        });
      } else if (data.startsWith('cancel_')) {
        const id = data.split('_')[1];
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Delete', callback_data: `del_${id}` }]
              ]
            }
          })
        });
      } else if (data.startsWith('confdel_')) {
        const id = data.split('_')[1];
        const sheetUrl = process.env.GOOGLE_SHEET_URL;
        if (sheetUrl) {
          await fetch(sheetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: id })
          });
        }
        
        const originalText = query.message.text || '';
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: originalText + "\n\n<blockquote><b>✅ 𝗗𝗲𝗹𝗲𝘁𝗲𝗱 𝗳𝗿𝗼𝗺 𝗚𝗼𝗼𝗴𝗹𝗲 𝗦𝗵𝗲𝗲𝘁𝘀</b></blockquote>",
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
          })
        });
      }

      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: query.id })
      });

      return res.status(200).json({ success: true });
    }

    if (body && body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      if (text === '/start') {
        const welcomeMessage = `
<blockquote><b>𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝗣𝗿𝗼𝗱𝗶𝗴𝘆 𝗞𝗶𝗻𝗱𝗲𝗿𝗴𝗮𝗿𝘁𝗲𝗻 𝗔𝗱𝗺𝗶𝗻 𝗕𝗼𝘁!</b></blockquote>

<blockquote><b>𝗜 𝗮𝗺 𝗼𝗻𝗹𝗶𝗻𝗲 𝗮𝗻𝗱 𝗜 𝘄𝗶𝗹𝗹 𝘀𝗲𝗻𝗱 𝘆𝗼𝘂 𝘁𝗵𝗲𝗶𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀 𝗶𝗺𝗺𝗲𝗱𝗶𝗮𝘁𝗲𝗹𝘆.</b></blockquote>

<blockquote><b>𝗝𝘂𝘀𝘁 𝘄𝗮𝗶𝘁 𝗳𝗼𝗿 𝘁𝗵𝗲 𝗻𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀!</b></blockquote>
        `.trim();

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                [{ text: '📊 Open Excel' }]
              ],
              resize_keyboard: true,
              is_persistent: true
            }
          })
        });
      } else if (text === '📊 Open Excel' || text.toLowerCase() === 'open excel') {
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/11HKem9SOalD14u_WkJ047Hr_65n3NB2aORR1fwLo7cI/edit';
        
        const excelMsg = `<blockquote><b>𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝘀𝗲𝗰𝘂𝗿𝗲 𝗹𝗶𝗻𝗸 𝘁𝗼 𝘁𝗵𝗲 𝗚𝗼𝗼𝗴𝗹𝗲 𝗦𝗵𝗲𝗲𝘁. 𝗖𝗹𝗶𝗰𝗸 𝘁𝗵𝗲 𝗯𝘂𝘁𝘁𝗼𝗻 𝗯𝗲𝗹𝗼𝘄 𝘁𝗼 𝗼𝗽𝗲𝗻 𝗶𝘁:</b></blockquote>`;
        
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: excelMsg,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Open Excel', url: sheetUrl }]
              ]
            }
          })
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
}

