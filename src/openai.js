const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

async function getCompletion(answer, contact) {
  const model = 'gpt-3.5-turbo';
  const maxTokens = 2048;
  const temperature = 0;
  const topP = 0;

  try {
    const response = await openai.createChatCompletion({
      model: model,
      messages: answer,
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP,
    });

    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = getCompletion;
