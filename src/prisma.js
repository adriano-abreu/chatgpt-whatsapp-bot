const getCompletion = require('./openai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function storeAnswer(userAnswer, phoneNumber, name) {
  try {
    // Procura um usuário no banco de dados com o número de telefone especificado
    const user = await prisma.user.findUnique({
      where: {
        phone: phoneNumber,
      },
      // Inclui as conversas do usuário, que por sua vez incluem as mensagens trocadas nessas conversas
      include: {
        chats: {
          include: {
            chat: {
              include: {
                contents: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    // Se o usuário não existir, cria um novo usuário e inicia uma nova conversa com o assistente
    if (!user) {
      const newUser = await createUser(phoneNumber, name);
      const response = await getChatContent(newUser, userAnswer, phoneNumber);
      return response;
    } else {
      // Se o usuário existir, continua a conversa com o assistente
      const response = await getChatContent(user, userAnswer, phoneNumber);
      return response;
    }
  } catch (error) {
    // Trata possíveis erros que possam ocorrer durante a execução da função
    console.error(
      `Erro ao armazenar resposta para o contato ${name}: ${error.message}`
    );
    throw new Error(
      `Erro ao armazenar resposta para o contato ${name}: ${error.message}`
    );
  }

  async function createUser(contact, name) {
    try {
      // Cria um novo usuário no banco de dados com o número de telefone e nome especificados
      const newUser = await prisma.user.create({
        data: {
          phone: contact,
          name: name,
          createdAt: new Date(),
          // Cria uma nova conversa para o usuário com uma mensagem de boas-vindas do assistente
          chats: {
            create: {
              chat: {
                create: {
                  tokenSize: 0,
                  contents: {
                    create: [
                      {
                        role: 'assistant',
                        content:
                          'Seu nome é Jarvis, você é um assiste útil de programação e está aqui para ajudar as pessoas.',
                        createdAt: new Date(),
                        totalTokens: 36,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        // Inclui as conversas do usuário, que por sua vez incluem as mensagens trocadas nessas conversas
        include: {
          chats: {
            include: {
              chat: {
                include: {
                  contents: true,
                },
              },
            },
          },
        },
      });

      // Retorna o novo usuário criado
      return newUser;
    } catch (error) {
      // Trata possíveis erros que possam ocorrer durante a execução da função
      console.error(
        `Erro ao criar usuário com o contato ${contact}: ${error.message}`
      );
      throw new Error(
        `Erro ao criar usuário com o contato ${contact}: ${error.message}`
      );
    }
  }
  async function getChatContent(user, userAnswer, contact) {
    try {
      // Obtém o ID da conversa do usuário
      const chatId = user.chats[0].chat[0].id;

      // Obtém as mensagens trocadas na conversa do usuário e adiciona a resposta do usuário mais recente
      const userChats = user.chats[0].chat[0].contents.map((item) => ({
        role: item.role,
        content: item.content,
      }));
      userChats.push({ role: 'user', content: userAnswer });

      // Obtém a resposta do assistente usando o modelo de linguagem GPT-3
      const response = await getCompletion(userChats, contact);
      const promptTokens = response.data.usage.prompt_tokens;
      const totalSize = response.data.usage.total_tokens;

      // Cria uma nova mensagem no banco de dados com a resposta do usuário
      await prisma.contents.create({
        data: {
          role: 'user',
          content: userAnswer,
          totalTokens: promptTokens,
          createdAt: new Date(),
          chat: {
            connect: {
              id: chatId,
            },
          },
        },
      });

      // Atualiza o tamanho total de tokens da conversa no banco de dados
      await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          tokenSize: totalSize,
        },
      });

      // Se o tamanho total de tokens da conversa for maior que 1400, deleta o histórico de conversas do usuário
      if (totalSize > 1400) {
        await deleteHistoric(contact);
      }

      // Armazena a resposta do assistente no banco de dados
      await storeReply(response, contact);

      // Retorna a resposta do assistente
      return response;
    } catch (error) {
      // Trata possíveis erros que possam ocorrer durante a execução da função
      console.error(
        `Erro ao obter conteúdo da conversa para o contato ${contact}: ${error.message}`
      );
      throw new Error(
        `Erro ao obter conteúdo da conversa para o contato ${contact}: ${error.message}`
      );
    }
  }
}

async function storeReply(response, contact) {
  try {
    // Busca o usuário com o número de telefone especificado
    const user = await prisma.user.findUnique({
      where: {
        phone: contact,
      },
      // Inclui as conversas desse usuário, que por sua vez incluem as mensagens trocadas nessas conversas
      include: {
        chats: {
          include: {
            chat: {
              include: {
                contents: true,
              },
            },
          },
        },
      },
    });

    // Extrai o número de tokens de conclusão e a resposta do objeto de resposta
    const completionTokens = response.data.usage.completion_tokens;
    const reply = response.data.choices[0].message.content;

    // Cria uma nova mensagem no banco de dados com a resposta do assistente
    await prisma.contents.create({
      data: {
        role: 'assistant',
        content: reply,
        totalTokens: completionTokens,
        createdAt: new Date(),
        chat: {
          connect: {
            id: user.chats[0].chat[0].id,
          },
        },
      },
    });
  } catch (error) {
    // Trata possíveis erros que possam ocorrer durante a execução da função
    console.error(
      `Erro ao armazenar resposta do assistente para o contato ${contact}: ${error.message}`
    );
    throw new Error(
      `Erro ao armazenar resposta do assistente para o contato ${contact}: ${error.message}`
    );
  }
}

async function deleteHistoric(contact) {
  try {
    // Busca o usuário com o número de telefone especificado
    const itemsToDelete = await prisma.user.findUnique({
      where: {
        phone: contact,
      },
      // Inclui as conversas desse usuário, que por sua vez incluem as mensagens trocadas nessas conversas
      include: {
        chats: {
          include: {
            chat: {
              include: {
                contents: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                  skip: 1,
                  select: {
                    id: true,
                    totalTokens: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Cria um array com os IDs das mensagens que devem ser deletadas
    const idsToDelete = itemsToDelete.chats[0].chat[0].contents.map((item) => ({
      id: item.id,
      totalTokens: item.totalTokens,
    }));
    let totalTokens = 0;
    let ids = [];

    // Seleciona as mensagens mais antigas, até que a soma do total de tokens dessas mensagens atinja um limite de 600 * idsToDelete.length  tokens por mensagem
    const numTokensToDelete = idsToDelete.length;
    for (let i = 0; i < numTokensToDelete; i++) {
      if (totalTokens + idsToDelete[i].totalTokens <= 600 * numTokensToDelete) {
        totalTokens += idsToDelete[i].totalTokens;
        ids.push(idsToDelete[i].id);
      } else {
        break;
      }
    }

    // Deleta as mensagens selecionadas do banco de dados
    await prisma.contents.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  } catch (error) {
    // Trata possíveis erros que possam ocorrer durante a execução da função
    console.error(
      `Erro ao deletar histórico do contato ${contact}: ${error.message}`
    );
    throw new Error(
      `Erro ao deletar histórico do contato ${contact}: ${error.message}`
    );
  }
}

module.exports = { storeAnswer, storeReply, deleteHistoric };
