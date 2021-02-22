// burada login girerken mesela e-mail vermiş mi vs kontrol et.
const bcrypt = require("bcryptjs");
const validateUserInput = (email, password) => {
  return email && password;
};
const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { validateUserInput, comparePassword };
