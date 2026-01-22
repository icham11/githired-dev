const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        let user = await User.findOne({ where: { googleId } });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ where: { email } });

        if (user) {
          user.googleId = googleId;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          username: profile.displayName || email.split("@")[0],
          email: email,
          password: "GOOGLE_LOGIN_" + Math.random().toString(36).substring(7), // Dummy password
          googleId: googleId,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

module.exports = passport;

//apa yang terjadi dengan kode di atas?
//jelaskan perbaris
// Baris 1: Mengimpor modul 'passport' yang digunakan untuk otentikasi pengguna.
// Baris 2: Mengimpor strategi Google OAuth 2.0 dari paket 'passport-google-oauth20'.
// Baris 3: Mengimpor model User dari direktori models untuk berinteraksi dengan data pengguna di database.
// Baris 5-56: Mendefinisikan strategi Google OAuth 2.0 untuk Passport.
// Baris 6-12: Mengatur konfigurasi strategi, termasuk ID klien, rahasia klien, URL callback, dan opsi proxy.
// Baris 13-54: Mendefinisikan fungsi callback yang akan dipanggil setelah Google mengotentikasi pengguna.
// Baris 14: Fungsi callback menerima token akses, token penyegaran, profil pengguna, dan fungsi done.
// Baris 15-16: Mencoba mengeksekusi kode dalam blok try-catch untuk menangani potensi kesalahan.
// Baris 17: Mengambil email pengguna dari profil yang diberikan oleh Google.
// Baris 18: Mengambil ID Google pengguna dari profil.
// Baris 20: Mencari pengguna di database berdasarkan googleId.
// Baris 22-24: Jika pengguna ditemukan, memanggil fungsi done dengan pengguna tersebut.
// Baris 26: Mencari pengguna di database berdasarkan email.
// Baris 28-32: Jika pengguna ditemukan berdasarkan email, memperbarui googleId dan menyimpan perubahan, lalu memanggil done.
// Baris 34-42: Jika pengguna tidak ditemukan, membuat pengguna baru dengan informasi dari profil Google dan menyimpan ke database.
// Baris 44: Memanggil fungsi done dengan pengguna baru yang telah dibuat
