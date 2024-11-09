const Discord = require("discord.js");
const config = require("../../config.json")

module.exports = {
    name: "autoconnect",
    description: "Sistema de autoconnect",
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction, args) => {

        if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: "\`\`🔮\`\` **Você não tem permições suficentes!**" })

        let embed_painel = new Discord.EmbedBuilder()
            .setColor('2f3136')
            .setAuthor({ name: 'Sistema de AutoConnect', iconURL: client.user.displayAvatarURL({ dynamic: true }), })
            .setDescription(`**STATUS:**
            \`\`\`🟢Online\`\`\`
            **IP MTA:SA:**
            \`\`\`CONNECT 1.2.3:1234\`\`\``)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))

        let iniciar = new Discord.ButtonBuilder().setLabel("🔌 Conectar-se").setStyle(Discord.ButtonStyle.Link).setURL(config.link);
        const painel_wl = new Discord.ActionRowBuilder().addComponents(iniciar)

        interaction.reply({ embeds: [embed_painel], components: [painel_wl] })
    }
}