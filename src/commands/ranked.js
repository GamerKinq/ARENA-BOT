const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder().setName('ranked').setDescription('En iyi 10 Arena savaşçısı'),
    async execute(interaction) {
        const dbPath = path.join(__dirname, '../../database.json');
        if (!fs.existsSync(dbPath)) return interaction.reply('Veri bulunamadı.');
        const db = JSON.parse(fs.readFileSync(dbPath));
        const sorted = Object.entries(db).sort(([, a], [, b]) => b.points - a.points).slice(0, 10);
        const embed = new EmbedBuilder().setTitle('🏆 RANKED LİDERLERİ').setColor(0xFFD700);
        const desc = sorted.map(([id, d], i) => `**${i+1}.** <@${id}> | 🛡️ **${d.points} LP** | 🏆 ${d.wins} Win`).join('\n');
        embed.setDescription(desc || "Henüz savaşan yok!");
        await interaction.reply({ embeds: [embed] });
    }
};