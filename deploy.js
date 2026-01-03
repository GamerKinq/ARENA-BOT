const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('arena')
        .setDescription('3 maçlık Street Fighter serisini başlatır'),
    new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Puanını ve global sıralamayı gösterir')
        .addUserOption(option => option.setName('user').setDescription('Bakılacak kullanıcı')),
    new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Kurucuya özel yönetim paneli')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken('BOT-TOKEN');

(async () => {
    try {
        console.log('Komutlar sunucuya kaydediliyor...');
        await rest.put(
            Routes.applicationGuildCommands('1380964918328692808', '1442333314508783786'),
            { body: commands },
        );
        console.log('✅ Komutlar BAŞARIYLA yüklendi! Artık Discord\'da / tuşuna basabilirsin.');
    } catch (error) {
        console.error('Hata oluştu:', error);
    }
})();