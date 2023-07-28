require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

class ChatGPT {
  constructor() {
    this.config = new Configuration({
      apiKey: process.env.CHATGPT_API,
    });
    this._openai = new OpenAIApi(this.config);
    this.results = null;
    this.prompt = null;
  }

  async LLM() {
    const ChatCompletion = await this._openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: this.prompt.system,
        },
        { role: "user", content: this.prompt.user },
      ],
    });

    const response = ChatCompletion.data.choices[0].message;
    console.log(response.content);
    this.results = await JSON.parse(response.content);

    return this.results;
  }

  getprompt() {
    return this.prompt;
  }

  setPrompt(newPrompt) {
    this.prompt = newPrompt;
  }
}

module.exports = ChatGPT;
