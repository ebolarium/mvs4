// Bu dosya, kullanıcı (grup) modelini tanımlar.
// Mongoose kullanarak veritabanında kullanıcıların nasıl saklanacağını belirler.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // Kullanıcının e-posta adresi, benzersiz ve zorunlu.
  email: { type: String, required: true, unique: true },
  // Grubun adı, zorunlu.
  bandName: { type: String, required: true },
  // Hashlenmiş şifre, zorunlu.
  password: { type: String, required: true },
  // Hesabın oluşturulma tarihi, varsayılan olarak şu anki tarih.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);