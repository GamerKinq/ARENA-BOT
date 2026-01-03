const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// --- CMD GÖRSELLEŞTİRME AYARLARI ---
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

const asciiArt = `
${colors.red}${colors.bright}
   _____ _______ _____  ______ ______ _______ 
  / ____|__   __|  __ \\|  ____|  ____|__   __|
 | (___    | |  | |__) | |__  | |__     | |   
  \\___ \\   | |  |  _  /|  __| |  __|    | |   
  ____) |  | |  | | \\ \\| |____| |____   | |   
 |_____/   |_|  |_|  \\_\\______|______|  |_|   
                                              
  ______ _____ _____ _    _ _______ ______ _____  
 |  ____|_   _/ ____| |  | |__   __|  ____|  __ \\ 
 | |__    | || |  __| |__| |  | |  | |__  | |__) |
 |  __|   | || | |_ |  __  |  | |  |  __| |  _  / 
 | |     _| || |__| | |  | |  | |  | |____| | \\ \\ 
 |_|    |_____\\_____|_|  |_|  |_|  |______|_|  \\_\\
${colors.reset}
`;

client.once('ready', () => {
    console.clear(); // Eski yazıları temizle
    console.log(asciiArt);
    
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}${colors.bright}  [SİSTEM]${colors.reset} ${colors.white}Arena Botu Başarıyla Başlatıldı!${colors.reset}`);
    console.log(`${colors.green}${colors.bright}  [DURUM] ${colors.reset} ${colors.white}Bot Çevrimiçi: ${client.user.tag}${colors.reset}`);
    console.log(`${colors.blue}${colors.bright}  [TARİH] ${colors.reset} ${colors.white}01.01.2026${colors.reset}`);
    console.log(`${colors.magenta}${colors.bright}  [ADMIN] ${colors.reset} ${colors.white}ID: 294559051914805248${colors.reset}`);
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    console.log(`\n${colors.white}Komutlar yükleniyor...${colors.reset}`);
    console.log(`${colors.green}✔ /arena komutu aktif!${colors.reset}`);
    console.log(`${colors.green}✔ Bot durumu 5 saniyede bir güncelleniyor...${colors.reset}\n`);
    
    // Bot durumunu güncelleme döngüsü
    setInterval(() => {
        client.user.setActivity('Street Fighter | /arena', { type: 0 }); // 0: Playing
    }, 5000);
});

// Botunuzun login işlemi
// client.login('TOKEN_BURAYA');