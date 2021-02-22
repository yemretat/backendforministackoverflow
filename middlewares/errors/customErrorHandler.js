const CustomError = require("../../helpers/error/customError");
const customErrorHandler = (err, req, res, next) => {
  let customError = err;
  // senkron kodlarımızı express yakalayabiliyor , fakat asekron kodlarımızda hata varsa
  // bizim expresse next parametresiyle geçirmemiz lazım
  console.log(customError.name, customError.message, customError.status);
  console.log(err);
  // burada main amaç hem mesaj hem status sağlama çünkü express tarafından yayınlanan errorların statüsü yok

  if (err.name === "SyntaxError") {
    // yani eğer SyntaxError newlendiyse buraya gidiyor.
    customError = new CustomError("Unexpected Syntax", 400);
  }
  if (err.name === "ValidationError") {
    customError = new CustomError(err.message, 400);
  }
  if (err.name == "CastError") {
    customError = new CustomError("Please provide a valid id", 400);
  }

  //bunu yapmamızın sebebi user'da unique olunca içinda hatayı dönünce o hata direkt
  //usera nerede olduğunu falan dönüyor.Sıkıntı bir durum
  //kendi elimizle yapalım çünkü uniquede validator yok.
  // hata alıyorsan gel buraya hataya bak sonra özelleştir.
  if (err.code === 11000) {
    customError = new CustomError("Duplicate Key Found", 400);
  }

  res.status(customError.status || 500).json({
    success: false,
    message: customError.message || "Internal Server Error",
  }); // kullanıcımıza hatayı dönücez
};

module.exports = customErrorHandler;
