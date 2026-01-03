const { REST, Routes } = require('discord.js');
const commands = [
    { name: 'arena', description: 'Savaşı başlat!' },
    { name: 'rank', description: 'Sıralamayı gör!' }
];
const rest = new REST({ version: '10' }).setToken('BOT-TOKEN');

(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands('1380964918328692808', '1442333314508783786'), { body: commands });
        console.log('✅ Komutlar yüklendi!');
    } catch (e) { console.error(e); }

})();
