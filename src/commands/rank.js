const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder().setName('rank').setDescription('Global Sıralama Tablosu'),
    async execute(interaction) {
        const dbPath = path.join(__dirname, '../../database.json');
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const sorted = Object.entries(db).sort(([, a], [, b]) => b.points - a.points).slice(0, 10);
        const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];
        const desc = sorted.map(([id, d], i) => `${medals[i] || "🏅"} **${d.points} LP** | <@${id}>`).join('\n');
        const embed = new EmbedBuilder().setTitle('🏆 ARENA RANKINGS').setDescription(desc || "Sıralama boş!").setColor(0xF1C40F);
        await interaction.reply({ embeds: [embed] });
    }
};