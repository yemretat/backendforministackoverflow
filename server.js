const express = require("express");
const dotenv = require("dotenv"); //env cınfige erişmememizi sağlayan packet
const app = express();
const routers = require("./routers/index");
const connectDatabase = require("./helpers/database/connectDatabase");
const customeErrorHandler = require("./middlewares/errors/customErrorHandler");
const path = require("path");

dotenv.config({
  path: "./config/env/config.env",
});
// Mongo Db connection
connectDatabase();

const PORT = process.env.PORT; //config.env'dan çekiyoruz

app.use(express.json()); //bu sen post işleminde bodye json datasını
// koymasını sağlayan middleware

// Routers Middleware , burada routerları karşılasın diye index.jsde koyduk tüm routerları

app.use("/api", routers);

//Error Middleware'i

app.use(customeErrorHandler); //Bu middleware sayesinde kendi error handlingimizi çalıştırdık expressinkini
//değil

// static files
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => {
  console.log(`App started on ${PORT} : ${process.env.NODE_ENV}`);
});
