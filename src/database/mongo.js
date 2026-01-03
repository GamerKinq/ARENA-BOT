const mongoose = require('mongoose');

module.exports = async () => {
    // Bu link SRV (DNS) kullanmaz, doğrudan sunuculara bağlanır
const mongoURI = "mongodb://arena_user:gamerkinq@cluster0-shard-00-00.ldyqw4g.mongodb.net:27017,cluster0-shard-00-01.ldyqw4g.mongodb.net:27017,cluster0-shard-00-02.ldyqw4g.mongodb.net:27017/arena_bot?ssl=true&authSource=admin&retryWrites=true&w=majority";

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // 5 saniye bekleyip hata ver
            connectTimeoutMS: 10000,       // Bağlanmak için 10 saniye tanı
        });
        console.log('✅ MongoDB Atlas Bağlantısı Başarılı!');
    } catch (err) {
        console.error('❌ Atlas Bağlantı Hatası:', err.message);
        console.log('⚠️ Veritabanı bağlanamadı, ancak bot başlatılıyor...');
    }
};