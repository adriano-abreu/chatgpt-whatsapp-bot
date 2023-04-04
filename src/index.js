const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { storeAnswer } = require('./prisma');

const client = new Client({
  authStrategy: new LocalAuth({ session: {} }),
});

try {
  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', (session) => {
    session = session;
  });

  client.on('ready', () => {
    console.log('Client is ready!');
  });

  client.initialize();
  client.on('message', async (msg) => {
    let chat = await msg.getChat();
    let contact = await msg.getContact();

    if (msg.body.startsWith('!bot')) {
      const phoneNumber = contact.number;
      const name = contact.name ? contact.name : contact.pushname;

      const userAnswer = msg.body.replace('!bot', '').trim();

      const response = await storeAnswer(userAnswer, phoneNumber, name);

      const text = response.data.choices[0].message.content;
      chat.isGroup ? msg.reply(text) : client.sendMessage(msg.from, text);
    }
  });
} catch (error) {
  console.log(error);
}
