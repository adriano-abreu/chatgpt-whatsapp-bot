# ChatGPT WhatsApp Bot

Este projeto é um bot de WhatsApp que utiliza JavaScript, Prisma, whatsapp-web.js e a API da OpenAI para responder perguntas dos usuários via WhatsApp. Com este bot, os usuários podem fazer perguntas e receber respostas geradas pelo modelo de linguagem GPT-3.5 da OpenAI.

## Pré-requisitos

Certifique-se de ter instalado:

- Node.js (versão 14.0.0 ou superior)
- npm (versão 6.0.0 ou superior)

## Configuração

1. Clone o repositório:

    git clone https://github.com/adriano-abreu/chatgpt-whatsapp-bot.git
    
    cd chatgpt-whatsapp-bot
   

2. Instale as dependências do projeto:

  
   npm install
   

3. Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais da API da OpenAI:

  
   OPENAI_API_KEY=<sua_chave_de_api>
   

4. Inicie o banco de dados Prisma:

   
   npx prisma migrate dev --name init
   

5. Inicie o servidor:

   
   npm run dev
   

## Como usar

1. No WhatsApp, adicione o número de telefone do bot aos seus contatos.

2. Abra uma nova conversa com o bot.

3. Envie perguntas para o bot no formato de texto. Por exemplo:

   
   !bot Qual é a capital da França?
   

4. O bot processará sua pergunta e enviará uma resposta gerada pelo modelo GPT-3.5 da OpenAI.

5. Para fazer uma nova pergunta, basta enviar outra mensagem de texto.

## Contribuindo

Agradecemos suas contribuições! Por favor, sinta-se à vontade para enviar issues e pull requests.

