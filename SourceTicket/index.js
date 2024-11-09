const Discord = require("discord.js");
const {
  Client,
  Intents,
  GatewayIntentBits,
  ActivityType,
  PermissionFlagsBits,
} = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require("./config.json");
const { QuickDB } = require("quick.db");
const db = new QuickDB(); // using default driver

client.login(config.token);

module.exports = client;
client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.config = require("./config.json");
require("./handler")(client);
const { glob } = require("glob");
const { promisify } = require("util");

const globPromise = promisify(glob);

client.once("ready", () => {
  console.log("💜 | Dev: TioBigode");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) return;

  if (interaction.isCommand()) {
    const cmd = client.slashCommands.get(interaction.commandName);

    if (!cmd) return;

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }

    cmd.run(client, interaction, args);
  }

  if (interaction.isContextMenuCommand()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.slashCommands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }
});

/////////////Ignorar///////////////

client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    let choice = interaction.values[0];
    const member = interaction.member;
    const guild = interaction.guild;
    if (choice == "duvida") {
      let embedDuvida = new Discord.EmbedBuilder();
    }

    ///////////// TICKET ////////////////
    else if (choice == "ticket" || choice == "suporte_sales") {
      // Verifique se o usuário já tem um ticket
      if (
        interaction.guild.channels.cache.find(
          (ca) => ca.name === `ticket-${member.id}`
        )
      ) {
        let canal = interaction.guild.channels.cache.find(
          (ca) => ca.name === `ticket-${member.id}`
        );

        let jaTem = new Discord.EmbedBuilder()
          .setDescription(
            ` **<a:aviso:1066263831740960829> - Você já tem um ticket criado em: ${canal}.**`
          )
          .setColor("#00FF00");

        interaction.reply({ embeds: [jaTem], ephemeral: true });
      } else {
        // Obtém as categorias e cargos de acordo com a escolha
        let cargoTicket = await db.get("cargoModerate.cargoM"); // Cargo dos STAFF's
        let CategoriaTicket;

        // Define a categoria baseada na escolha do usuário
        if (choice == "ticket") {
          CategoriaTicket = await db.get("Categoria.Categoria"); // Categoria de Tickets
        } else if (choice == "suporte_sales") {
          CategoriaTicket = await db.get("Categoria.SuporteSales"); // Categoria de Suporte de Vendas
        }

        // Verifica se a categoria foi encontrada
        if (!CategoriaTicket || !CategoriaTicket.id) {
          return interaction.reply({
            content: `**Categoria de ticket não encontrada!**`,
            ephemeral: true,
          });
        }

        // Criação do canal de ticket
        guild.channels
          .create({
            name: `ticket-${member.id}`,
            type: 0, // Canal de texto
            parent: `${CategoriaTicket.id}`, // Categoria específica baseada na escolha
            topic: interaction.user.id,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AddReactions",
                  "AttachFiles",
                ],
              },
              {
                id: cargoTicket.id, // Cargo STAFF
                allow: [
                  "ViewChannel",
                  "SendMessages",
                  "AddReactions",
                  "AttachFiles",
                  "ManageMessages",
                ],
              },
            ],
          })
          .then((ca) => {
            interaction
              .reply({
                content: `** 😄 - Criando Ticket...**`,
                ephemeral: true,
              })
              .then(() => {
                setTimeout(() => {
                  let direciandoaocanal =
                    new Discord.ActionRowBuilder().addComponents(
                      new Discord.ButtonBuilder()
                        .setLabel(` - Ticket`)
                        .setEmoji("😄")
                        .setStyle(5)
                        .setURL(
                          `https://discord.com/channels/${interaction.guild.id}/${ca.id}`
                        )
                    );

                  interaction.editReply({
                    content: `**😄 - Ticket criado na categoria!**`,
                    ephemeral: true,
                    components: [direciandoaocanal],
                  });
                }, 670);
              });

            let embedCanalTicket = new Discord.EmbedBuilder()
              .setColor("#00FF00")
              .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: `${interaction.user.displayAvatarURL()}`,
              })
              .setThumbnail(`${client.user.displayAvatarURL()}`)
              .setDescription(`*Boas Vindas ao seu Ticket*`)
              .addFields({
                name: "```📋 Suporte Geral:```",
                value: `Fale, o'que voce precisa?`,
                inline: false,
              })
              .setTimestamp();

            let FecharTicket = new Discord.ActionRowBuilder().addComponents(
              new Discord.ButtonBuilder()
                .setLabel(` - Fechar & Salvar`)
                .setEmoji("😄")
                .setCustomId("fechar")
                .setStyle(Discord.ButtonStyle.Primary),
              new Discord.ButtonBuilder()
                .setLabel(` - Lock`)
                .setEmoji("😄")
                .setCustomId("lock")
                .setStyle(Discord.ButtonStyle.Danger),
              new Discord.ButtonBuilder()
                .setLabel(` - Unlock`)
                .setEmoji("😄")
                .setCustomId("unlock")
                .setStyle(Discord.ButtonStyle.Success)
            );

            ca.send({ embeds: [embedCanalTicket], components: [FecharTicket] });
          })
          .catch((error) => {
            console.error("Erro ao criar o canal:", error);
            interaction.reply({
              content:
                "Houve um erro ao tentar criar o ticket. Tente novamente.",
              ephemeral: true,
            });
          });
      }
    }
  }
  if (interaction.isButton) {
    if (interaction.customId === "fechar") {
      const modalTicket = new Discord.ModalBuilder()
        .setCustomId("modal_ticket")
        .setTitle(`Fechar - Ticket`);
      const resposta1 = new Discord.TextInputBuilder()
        .setCustomId("resposta")
        .setLabel("Diga-nos a razão de fechar o ticket:")
        .setStyle(Discord.TextInputStyle.Paragraph);

      const firstActionRow = new Discord.ActionRowBuilder().addComponents(
        resposta1
      );
      modalTicket.addComponents(firstActionRow);
      await interaction.showModal(modalTicket);
    } else if (interaction.customId === "lock") {
      const cliente = interaction.guild.members.cache.get(
        interaction.channel.topic.slice(0, 18)
      );
      let cargoTicket2 = await db.get("cargoModerate.cargoM");
      if (
        !interaction.member.roles.cache.some(
          (role) => role.id == cargoTicket2.id
        )
      ) {
        interaction.reply({
          content: `**Apenas Administradores podem selecionar esta opção!**`,
          ephemeral: true,
        });
      } else {
        interaction.channel.permissionOverwrites.edit(cliente.user, {
          ViewChannel: false,
        });
        interaction.reply(
          `**<:fechado:1066260803797385266> - Canal trancado, permissão de visualizar canal fechada para ${cliente.user}!**`
        );
      }
    } else if (interaction.customId === "unlock") {
      const cliente = interaction.guild.members.cache.get(
        interaction.channel.topic.slice(0, 18)
      );
      let cargoTicket2 = await db.get("cargoModerate.cargoM");
      if (
        !interaction.member.roles.cache.some(
          (role) => role.id == cargoTicket2.id
        )
      ) {
        interaction.reply({
          content: `**Apenas Administradores podem selecionar esta opção!**`,
          ephemeral: true,
        });
      } else {
        interaction.channel.permissionOverwrites.edit(cliente.user, {
          ViewChannel: true,
        });
        interaction.reply(
          `**<:aberto:1066260801310171137> - Canal destrancado, permissão de visualizar canal concedida para ${cliente.user}!**`
        );
      }
    }
  }
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === "modal_ticket") {
    const respostaFinal = interaction.fields.getTextInputValue("resposta");

    interaction
      .reply({
        content: `**<:oks:1066259580625104896> - Resposta enviada, canal será deletado em 3s**`,
        ephemeral: true,
      })
      .then((aviso) => {
        setTimeout(() => {
          interaction
            .editReply(
              {
                content: `**<:oks:1066259580625104896> - Resposta enviada, canal será deletado em 2s**`,
                ephemeral: true,
              },
              1000
            )
            .then((aviso1) => {
              setTimeout(() => {
                interaction.editReply({
                  content: `**<:oks:1066259580625104896> - Resposta enviada, canal será deletado em 1s**`,
                  ephemeral: true,
                });
              }, 1000);
            })
            .then(() => {
              setTimeout(async () => {
                const cliente = interaction.guild.members.cache.get(
                  interaction.channel.topic.slice(0, 18)
                );

                let channel = interaction.channel;
                const attachment = await discordTranscripts.createTranscript(
                  channel,
                  {
                    fileName: `${channel.name}.html`,
                  }
                );

                interaction.channel.delete();
                const channelDeleted = interaction.channel.name;

                let embedLog = new Discord.EmbedBuilder()

                  .setAuthor({
                    name: `${cliente.user.username}`,
                    iconURL: `${cliente.user.displayAvatarURL()}`,
                  })
                  .setColor("#00FF00")
                  .setTitle(`${channelDeleted}`)
                  .setDescription(
                    `*Ticket fechado, informações:* \n**(Transcripts Anexados)**\n`
                  )
                  .addFields(
                    {
                      name: `<a:world:1065754283099836417> - ID de quem fechou:`,
                      value: `\`\`\`${interaction.user.id}\`\`\``,
                      inline: true,
                    },
                    {
                      name: `<a:world:1065754283099836417> - ID de quem abriu:`,
                      value: `\`\`\`${cliente.id}\`\`\``,
                      inline: true,
                    },
                    {
                      name: `<:setabranca:1065754274568613888> - Quem fechou:`,
                      value: `${interaction.user}`,
                      inline: false,
                    },
                    {
                      name: `<:setabranca:1065754274568613888> - Quem abriu:`,
                      value: `${cliente.user}`,
                      inline: false,
                    },
                    {
                      name: `<:cupom:1065754248521977866> - Ticket:`,
                      value: `${channelDeleted}`,
                      inline: true,
                    },
                    {
                      name: "<:termos:1065754312103428196> - Motivo do Fechamento:",
                      value: `\`\`\`${respostaFinal}\`\`\``,
                      inline: false,
                    }
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `Ticket fechado por: ${interaction.user.tag}`,
                    iconURL: `${interaction.user.displayAvatarURL()}`,
                  })
                  .setThumbnail(`${cliente.user.displayAvatarURL()}`);

                let embedLogUser = new Discord.EmbedBuilder()

                  .setAuthor({
                    name: `${cliente.user.username}`,
                    iconURL: `${cliente.user.displayAvatarURL()}`,
                  })
                  .setColor("#00FF00")
                  .setTitle(`<:cupom:1065754248521977866>  _Ticket Fechado_`)
                  .setDescription(`*Ticket fechado, informações:*`)
                  .addFields(
                    {
                      name: `<:setabranca:1065754274568613888> - Quem fechou:`,
                      value: `${interaction.user}`,
                      inline: false,
                    },
                    {
                      name: `<:setabranca:1065754274568613888> - Quem abriu:`,
                      value: `${cliente.user}`,
                      inline: false,
                    },
                    {
                      name: "<:termos:1065754312103428196> - Motivo do Fechamento:",
                      value: `\`\`\`${respostaFinal}\`\`\``,
                      inline: false,
                    }
                  )
                  .setTimestamp()
                  .setThumbnail(`${cliente.user.displayAvatarURL()}`)
                  .setFooter({
                    text: `Ticket fechado por: ${interaction.user.tag}`,
                    iconURL: `${interaction.user.displayAvatarURL()}`,
                  });

                let canalLogsT = await db.get("channelLogTicket.channel");

                cliente.user.send({ embeds: [embedLogUser] });
                await interaction.guild.channels.cache
                  .get(`${canalLogsT.id}`)
                  .send({
                    content: `\`<:cupom:1065754248521977866> - Transcript ⤵\``,
                    files: [attachment],
                    embeds: [embedLog],
                  });
              }, 1000);
            });
        });
      });
  }
});
