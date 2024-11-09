const Discord = require("discord.js");

module.exports = {
  name: "ticket",
  description: "Ticket para suporte.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "chat",
      description: "Mencione um canal.",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.Administrator
      )
    )
      return interaction.reply({
        content: `**${interaction.user}, Você precisa da permissão \`Administrador\` para usar este comando!**`,
        ephemeral: true,
      });
    else {
      let chat = interaction.options.getChannel("chat");

      if (!chat.send)
        return interaction.reply({
          content: `**${interaction.user}, Você provavelmente selecionou um canal de voz ou categoria. Por favor selecione um canal de texto.**`,
          ephemeral: true,
        });

      let rowTicket = new Discord.ActionRowBuilder().addComponents(
        new Discord.StringSelectMenuBuilder()
          .setCustomId("select2")
          .setPlaceholder("Selecionar Opção.")
          .addOptions({
            label: " - Ticket",
            description: "Clique aqui para abrir seu Ticket.",
            emoji: "😀",
            value: "ticket",
          })
      );

      let embedTicket = new Discord.EmbedBuilder()
        .setTitle("Ticket")
        .setDescription(`*Selecione uma opção de suporte abaixo!*`)
        .setColor("#00FF00")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.displayAvatarURL({
            dinamyc: true,
            format: "png",
          })}`,
        })
        .setFooter({
          text: `Copyright © | Tio Bigode`,
          iconURL: `${client.user.displayAvatarURL()}`,
        })
        .setThumbnail(`${interaction.guild.iconURL()}`)
        .setImage(
          "https://media.discordapp.net/attachments/1301307741691838496/1301308373727187015/logo02.png?ex=672bea5d&is=672a98dd&hm=93e2b105e27421baa152886b4397c6481a41df02bc3501e7294e541ec3d47305&=&format=webp&quality=lossless"
        );

      interaction.reply({
        content: `<:oks:1066259580625104896> - Feito! Ticket enviado no canal ${chat}!`,
        ephemeral: true,
      });
      chat.send({ components: [rowTicket], embeds: [embedTicket] });
    }
  },
};
 