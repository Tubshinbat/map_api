const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
var path = require("path");
var rfs = require("rotating-file-stream");
const mongoSanitize = require("express-mongo-sanitize");
const fileupload = require("express-fileupload");
const hpp = require("hpp");
var morgan = require("morgan");
const logger = require("./middleware/logger");
var cookieParser = require("cookie-parser");

// Router

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

//ROUTER IMPORT
const userRouters = require("./routes/Users");
const bannerRouters = require("./routes/Banners");
const uploadRouters = require("./routes/FileUpload");
const webInfoRouters = require("./routes/WebInfo");
const NewsRouters = require("./routes/News");
const NewsCategoriesRouters = require("./routes/NewsCategories");
const PlaceRouters = require("./routes/Place");
const PlaceCategoryRouters = require("./routes/PlaceCategories");
const PlanRouters = require("./routes/Plan");
const RateRouters = require("./routes/Rate");
const RoomRouters = require("./routes/Room");
const OrderRouters = require("./routes/Order");
const WebinfoRouters = require("./routes/WebInfo");
const SocialRouters = require("./routes/SocialLink");
const BankAccountRouters = require("./routes/BankAccount");
const QpayAccountRouters = require("./routes/Qpay");
const PolygonRouters = require("./routes/Polygon");
const CityRouters = require("./routes/City");
const DistrictRouter = require("./routes/District");
const KhorooRouter = require("./routes/Khoroo");

dotenv.config({ path: "./config/config.env" });
const app = express();

connectDB();

// Манай рест апиг дуудах эрхтэй сайтуудын жагсаалт :
var whitelist = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://127.0.0.1/:8081",
  "http://localhost:3001",
  "https://map.webr.mn",
  "http://map.webr.mn",
  "https://map.gotire.mn",
  "http://map.gotire.mn",
  "https://www.map.gotire.mn",
  "http://www.map.gotire.mn",
  "http://192.168.1.2:8081",
  "exp://192.168.1.2:8081",
];

// Өөр домэйн дээр байрлах клиент вэб аппуудаас шаардах шаардлагуудыг энд тодорхойлно
var corsOptions = {
  // Ямар ямар домэйнээс манай рест апиг дуудаж болохыг заана
  origin: function (origin, callback) {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      // Энэ домэйнээс манай рест рүү хандахыг зөвшөөрнө
      callback(null, true);
    } else {
      // Энэ домэйнд хандахыг хориглоно.
      callback(new Error("Хандах боломжгүй."));
    }
  },
  // Клиент талаас эдгээр http header-үүдийг бичиж илгээхийг зөвшөөрнө
  allowedHeaders: "Authorization, Set-Cookie, Content-Type",
  // Клиент талаас эдгээр мэссэжүүдийг илгээхийг зөвөөрнө
  methods: "GET, POST, PUT, DELETE",
  // Клиент тал authorization юмуу cookie мэдээллүүдээ илгээхийг зөвшөөрнө
  credentials: true,
};

app.use("/uploads", express.static("public/upload"));
// Cookie байвал req.cookie рүү оруулж өгнө0
app.use(cookieParser());
// Өөр өөр домэйнтэй вэб аппуудад хандах боломж өгнө
app.use(cors(corsOptions));
// логгер
app.use(logger);
// Body дахь өгөгдлийг Json болгож өгнө
app.use(express.json());

// Клиент вэб аппуудыг мөрдөх ёстой нууцлал хамгаалалтыг http header ашиглан зааж өгнө
app.use(helmet());
// клиент сайтаас ирэх Cross site scripting халдлагаас хамгаална
app.use(xss());
// Клиент сайтаас дамжуулж буй MongoDB өгөгдлүүдийг халдлагаас цэвэрлэнэ
app.use(mongoSanitize());
// Сэрвэр рүү upload хийсэн файлтай ажиллана
app.use(fileupload());
// http parameter pollution халдлагын эсрэг books?name=aaa&name=bbb  ---> name="bbb"
app.use(hpp());

var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});
app.use(morgan("combined", { stream: accessLogStream }));

// REST API RESOURSE
app.use("/api/v1/users", userRouters);
app.use("/api/v1/banners", bannerRouters);
app.use("/api/v1/webinfo", webInfoRouters);
app.use("/api/v1/upload", uploadRouters);
app.use("/api/v1/news", NewsRouters);
app.use("/api/v1/news-categories", NewsCategoriesRouters);
app.use("/api/v1/places", PlaceRouters);
app.use("/api/v1/place-categories", PlaceCategoryRouters);
app.use("/api/v1/plans", PlanRouters);
app.use("/api/v1/rates", RateRouters);
app.use("/api/v1/rooms", RoomRouters);
app.use("/api/v1/orders", OrderRouters);
app.use("/api/v1/webinfos", WebinfoRouters);
app.use("/api/v1/socials", SocialRouters);
app.use("/api/v1/bankaccounts", BankAccountRouters);
app.use("/api/v1/qpayaccounts", QpayAccountRouters);
app.use("/api/v1/polygons", PolygonRouters);
app.use("/api/v1/cities", CityRouters);
app.use("/api/v1/districts", DistrictRouter);
app.use("/api/v1/khoroos", KhorooRouter);

app.use(errorHandler);
// Алдаа үүсэхэд барьж авч алдааны мэдээллийг клиент тал руу автоматаар мэдээлнэ

// express сэрвэрийг асаана.
const server = app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} порт дээр аслаа....`)
);

// Баригдалгүй цацагдсан бүх алдаануудыг энд барьж авна
process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа : ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
