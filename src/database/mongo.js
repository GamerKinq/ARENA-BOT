const mongoose = require('mongoose');

module.exports = async () => {
    // Bu link SRV (DNS) kullanmaz, doğrudan sunuculara bağlanır
const mongoURI = "MANGO DB";

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
