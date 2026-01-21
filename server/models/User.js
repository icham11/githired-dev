const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs"); // Kita butuh ini untuk enkripsi password!

class User extends Model {
  // Method untuk cek password saat login nanti
  verifyPassword(inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
  }
}

module.exports = (sequelize) => {
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false, // Wajib isi
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Tidak boleh ada email kembar
        validate: {
          isEmail: true, // Validasi format email
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPro: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default user adalah Free
      },
    },
    {
      sequelize, // Koneksi database
      modelName: "User", // Nama model
      hooks: {
        // "Hook" / Kail: Jalankan fungsi ini SEBELUM membuat user baru
        beforeCreate: (user) => {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        },
      },
    },
  );

  return User;
};
