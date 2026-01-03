const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ComponentType, Events, 
    ActivityType, REST, Routes, SlashCommandBuilder, MessageFlags,
    ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,
    PermissionFlagsBits 
} = require('discord.js');
const fs = require('fs');

// --- ⚙️ YAPILANDIRMA ---
const CONFIG = {
    TOKEN: 'BOT-TOKEN',
    CLIENT_ID: 'BOT-CLİENT-İD',
    GUILD_ID: 'SUNUCU-İD',
    ADMIN_ID: 'ADMIN-İD' 
};

// İstediğin Yeni Kanal ID'leri
const CHANNELS = {
    ARENA_ODASI: 'ARENA-ODASI-İD', 
    OZET_ODASI: 'OZET-ODASI-İD',   
    RANK_ODASI: 'RANK-ODASI-İD'    
};

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

// --- 📂 VERİ YÖNETİMİ ---
let userRanks = fs.existsSync('./ranks.json') ? JSON.parse(fs.readFileSync('./ranks.json', 'utf8')) : {};
let pvpQueue = null; 

const saveRanks = () => fs.writeFileSync('./ranks.json', JSON.stringify(userRanks, null, 2));

const ensureUser = (id) => {
    if (!userRanks[id]) {
        userRanks[id] = { xp: 0, coins: 0, atkLvl: 1, defLvl: 1, hasSkill: false };
    }
    if (userRanks[id].hasSkill === undefined) userRanks[id].hasSkill = false;
    return userRanks[id];
};

const drawBar = (current, max, color) => {
    const segments = 10;
    const filled = Math.round((current / max) * segments);
    const emoji = color === 'red' ? '❤️' : '⚡';
    return `${emoji} [${'■'.repeat(Math.max(0, filled))}${'□'.repeat(Math.max(0, segments - filled))}] %${Math.max(0, current)}`;
};

// --- 🚀 KOMUTLARI KAYDET ---
client.once(Events.ClientReady, async () => {
    console.log(`⭐ Arena Botu Aktif: ${client.user.tag}`);
    
    const commands = [
        new SlashCommandBuilder().setName('arena').setDescription('PvP veya Bot savaşı başlatır.'),
        new SlashCommandBuilder().setName('profil').setDescription('Karakterini geliştirir.'),
        new SlashCommandBuilder().setName('rank').setDescription('Sıralamayı gösterir.'),
        new SlashCommandBuilder().setName('admin').setDescription('Yönetici paneli.'),
        new SlashCommandBuilder().setName('sil').setDescription('Mesajları temizler.')
            .addIntegerOption(o => o.setName('miktar').setDescription('1-100').setRequired(true))
    ].map(c => c.toJSON());

    const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);
    try {
        await rest.put(Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID), { body: commands });
        console.log('✅ Slash komutları güncellendi.');
    } catch (e) { console.error(e); }

    // Canlı Rank & Durum [2025-12-30]
    setInterval(async () => {
        try {
            const rChan = client.channels.cache.get(CHANNELS.RANK_ODASI);
            if (!rChan) return;
            const sorted = Object.entries(userRanks).sort(([, a], [, b]) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
            const list = sorted.map(([id, d], i) => `**#${i+1}** | <@${id}> | XP: \`${d.xp || 0}\` | Altın: \`${d.coins || 0}\``).join('\n');
            const embed = new EmbedBuilder().setTitle('🏆 GLOBAL SIRALAMA').setDescription(list || 'Veri yok.').setColor(0xFFAA00);
            
            const msgs = await rChan.messages.fetch({ limit: 5 });
            const m = msgs.find(msg => msg.author.id === client.user.id);
            if (m) await m.edit({ embeds: [embed] }).catch(() => {}); else await rChan.send({ embeds: [embed] });
            
            client.user.setActivity('⚔️ Arenayı İzliyor', { type: ActivityType.Competing });
        } catch (e) {}
    }, 5000);
});

// --- 🎮 ETKİLEŞİM YÖNETİCİSİ ---
client.on(Events.InteractionCreate, async interaction => {
    try {
        const uid = interaction.user.id;
        const userData = ensureUser(uid);

        // 🧹 SİL
        if (interaction.isChatInputCommand() && interaction.commandName === 'sil') {
            const miktar = interaction.options.getInteger('miktar');
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            const fetched = await interaction.channel.messages.fetch({ limit: miktar });
            const deleted = await interaction.channel.bulkDelete(fetched, true);
            return interaction.editReply(`✅ **${deleted.size}** mesaj silindi.`);
        }

        // 👤 PROFİL
        if (interaction.isChatInputCommand() && interaction.commandName === 'profil') {
            return await interaction.reply(renderProfile(interaction.user, userData));
        }

        // ⚙️ ADMIN
        if (interaction.isChatInputCommand() && interaction.commandName === 'admin') {
            if (uid !== CONFIG.ADMIN_ID) return interaction.reply({ content: '❌ Yetkiniz yok!', flags: [MessageFlags.Ephemeral] });
            const modal = new ModalBuilder().setCustomId('adm_modal').setTitle('Hızlı Yönetim');
            const r1 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('t').setLabel('Hedef Kullanıcı ID').setStyle(TextInputStyle.Short).setRequired(true));
            const r2 = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('a').setLabel('Eklenecek Altın').setStyle(TextInputStyle.Short).setRequired(true));
            modal.addComponents(r1, r2);
            return await interaction.showModal(modal);
        }

        // 🏟️ ARENA
        if (interaction.isChatInputCommand() && interaction.commandName === 'arena') {
            if (interaction.channel.id !== CHANNELS.ARENA_ODASI) return interaction.reply({ content: 'Savaşlar sadece Arena kanalında yapılabilir!', flags: [MessageFlags.Ephemeral] });
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('m_type').setPlaceholder('Savaş Modu Seç...').addOptions([
                    { label: '🤖 Bot Savaş (Rastgele)', value: 'bot', emoji: '🤖' },
                    { label: '🔥 PvP Savaş (Oyuncu)', value: 'pvp', emoji: '⚔️' }
                ])
            );
            return interaction.reply({ content: '🏟️ **ARENA MENÜSÜ**', components: [row] });
        }

        // --- SUBMITLER VE BUTONLAR ---
        if (interaction.isModalSubmit() && interaction.customId === 'adm_modal') {
            const target = interaction.fields.getTextInputValue('t');
            const amt = parseInt(interaction.fields.getTextInputValue('a')) || 0;
            ensureUser(target).coins += amt; saveRanks();
            return interaction.reply({ content: `✅ <@${target}> hesabına ${amt} altın eklendi.`, flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.isButton()) {
            if (['up_atk', 'up_def', 'buy_skill'].includes(interaction.customId)) {
                const cost = interaction.customId === 'buy_skill' ? 1000 : 500;
                if (userData.coins < cost) return interaction.reply({ content: '❌ Altının yetersiz!', flags: [MessageFlags.Ephemeral] });
                
                if (interaction.customId === 'buy_skill') {
                    if (userData.hasSkill) return interaction.reply({ content: '❌ Zaten skill sahibisin!', flags: [MessageFlags.Ephemeral] });
                    userData.hasSkill = true;
                } else if (interaction.customId === 'up_atk') userData.atkLvl++;
                else if (interaction.customId === 'up_def') userData.defLvl++;

                userData.coins -= cost;
                saveRanks();
                return interaction.update(renderProfile(interaction.user, userData));
            }
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'm_type') {
            if (interaction.values[0] === 'bot') {
                await interaction.update({ content: '🎲 Rakip aranıyor...', components: [] });
                return startBotFight(interaction, userData);
            } else {
                if (pvpQueue === uid) return interaction.update({ content: 'Sıradaydın...', components: [] });
                if (!pvpQueue) { pvpQueue = uid; return interaction.update({ content: '🔍 Rakip aranıyor...', components: [] }); }
                else { 
                    const oppId = pvpQueue; pvpQueue = null; 
                    await interaction.update({ content: '⚔️ Rakip bulundu! Hazırlanın...', components: [] });
                    return startPvPFight(interaction, userData, ensureUser(oppId), oppId);
                }
            }
        }
    } catch (e) { console.error(e); }
});

// --- 🥊 BOT SAVAŞ SİSTEMİ ---
async function startBotFight(interaction, userData) {
    const bots = [
        { name: 'NORMAL Bot', hp: 100, atk: 10, def: 0 },
        { name: 'Zırhlı Bot', hp: 110, atk: 12, def: 5 },
        { name: 'BOSS: Titan', hp: 115, atk: 15, def: 10 }
    ];
    const bot = bots[Math.floor(Math.random() * bots.length)];
    let p = { hp: 100, mp: 0 }, b = { hp: bot.hp };
    let battleLogs = [`Savaş başladı: **${bot.name}** vs **${interaction.user.username}**`];

    const tick = async () => {
        const emb = new EmbedBuilder().setTitle(`🛡️ Bot Arenası: ${bot.name}`).setColor(0xFF0000)
            .addFields({ name: '👤 Sen', value: `${drawBar(p.hp, 100, 'red')}\n${drawBar(p.mp, 100, 'blue')}`, inline: true }, { name: '🤖 Bot', value: `${drawBar(b.hp, bot.hp, 'red')}`, inline: true });
        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('a').setLabel('ATAK').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('s').setLabel('SKILL').setStyle(ButtonStyle.Primary).setDisabled(!userData.hasSkill || p.mp < 40)
        );
        const msg = await interaction.editReply({ embeds: [emb], components: [btns] });
        const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 30000 });
        
        col.on('collect', async i => {
            await i.deferUpdate(); col.stop();
            let pDmg = i.customId === 's' ? (40 + userData.atkLvl*3) : (18 + userData.atkLvl*2);
            if (i.customId === 's') p.mp -= 40;
            b.hp -= Math.max(5, pDmg - bot.def); p.mp = Math.min(100, p.mp + 20);
            battleLogs.push(`👤 Hamle: ${i.customId === 's' ? 'Skill' : 'Atak'}`);
            if (b.hp <= 0) return finalize(interaction, true, battleLogs, bot.name);
            let bDmg = Math.max(5, bot.atk - userData.defLvl);
            p.hp -= bDmg; battleLogs.push(`🤖 Bot vurdu: -${bDmg} HP`);
            if (p.hp <= 0) return finalize(interaction, false, battleLogs, bot.name);
            tick();
        });
    };
    tick();
}

// --- ⚔️ PvP SAVAŞ SİSTEMİ ---
async function startPvPFight(interaction, p1D, p2D, p2Id) {
    let p1 = { hp: 100, mp: 0, id: interaction.user.id, tag: interaction.user.username }, p2 = { hp: 100, mp: 0, id: p2Id, tag: (await client.users.fetch(p2Id)).username };
    let turn = p1.id, battleLogs = [`PvP başladı: <@${p1.id}> vs <@${p2.id}>`];

    const tick = async () => {
        const emb = new EmbedBuilder().setTitle('⚔️ PvP Savaş Alanı').setColor(0x00FFFF).addFields(
            { name: `👤 ${p1.tag}`, value: drawBar(p1.hp, 100, 'red'), inline: true },
            { name: `👤 ${p2.tag}`, value: drawBar(p2.hp, 100, 'red'), inline: true },
            { name: 'Sıra', value: `<@${turn}> hamle yap!` }
        );
        const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('a').setLabel('SALDIR').setStyle(ButtonStyle.Danger));
        await interaction.editReply({ embeds: [emb], components: [btn] });
        const col = (await interaction.fetchReply()).createMessageComponentCollector({ time: 45000 });
        
        col.on('collect', async i => {
            if (i.user.id !== turn) return;
            await i.deferUpdate(); col.stop();
            const attData = turn === p1.id ? p1D : p2D; const defData = turn === p1.id ? p2D : p1D;
            const target = turn === p1.id ? p2 : p1;
            let dmg = Math.max(10, 22 + attData.atkLvl - defData.defLvl);
            target.hp -= dmg; battleLogs.push(`⚔️ **<@${turn}>** saldırdı: -${dmg} HP`);
            if (target.hp <= 0) return finalize(interaction, turn, battleLogs, "PvP");
            turn = (turn === p1.id ? p2.id : p1.id); tick();
        });
    };
    tick();
}

// --- 🏁 BİTİŞ VE ÖZET ---
async function finalize(interaction, winner, logs, mode) {
    let winId = winner === true ? interaction.user.id : (winner === false ? "BOT" : winner);
    if (winId !== "BOT") { const d = ensureUser(winId); d.coins += 200; d.xp += 50; saveRanks(); }
    await interaction.editReply({ content: `🏁 **Savaş Bitti!** Kazanan: <@${winId}>`, embeds: [], components: [] });
    
    const ozet = client.channels.cache.get(CHANNELS.OZET_ODASI);
    if (ozet) {
        const emb = new EmbedBuilder().setTitle(`📝 Maç Özeti: ${mode}`).setDescription(logs.slice(-10).join('\n')).setColor(0x00FF00).setTimestamp();
        ozet.send({ embeds: [emb] });
    }
    
    setTimeout(async () => {
        try { 
            const f = await interaction.channel.messages.fetch({ limit: 15 }); 
            await interaction.channel.bulkDelete(f, true); 
        } catch(e) {}
    }, 15000);
}

function renderProfile(user, data) {
    const emb = new EmbedBuilder().setTitle(`🛡️ ${user.username} Profili`).setColor(data.hasSkill ? 0xFF00FF : 0x00AEFF).addFields(
        { name: '💰 Altın', value: `\`${data.coins || 0}\``, inline: true },
        { name: '🔥 Yetenek', value: data.hasSkill ? '✅ Aktif (Alev Patlaması)' : '❌ Kapalı', inline: true },
        { name: '⚔️ ATK', value: `Lvl ${data.atkLvl}`, inline: true },
        { name: '🛡️ DEF', value: `Lvl ${data.defLvl}`, inline: true }
    ).setThumbnail(user.displayAvatarURL());

    const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('up_atk').setLabel('ATK+1 (500)').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('up_def').setLabel('DEF+1 (500)').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('buy_skill').setLabel(data.hasSkill ? 'Yetenek Alındı' : 'Yetenek Al (1000)').setStyle(ButtonStyle.Primary).setDisabled(data.hasSkill)
    );
    return { embeds: [emb], components: [btns] };
}

// OTOMATİK GUARD
client.on(Events.MessageCreate, m => { 
    if (!m.author.bot && m.channel.id === CHANNELS.ARENA_ODASI) m.delete().catch(() => {}); 
});

client.login(CONFIG.TOKEN);