const Polygon = require("../models/Polygon");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const iconv = require("iconv-lite");
const { slugify } = require("transliteration");
const turf = require("@turf/turf");

const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const { sortBuild, getModelPaths } = require("../lib/build");
const shapefile = require("shapefile");
const City = require("../models/City");
const District = require("../models/District");
const Khoroo = require("../models/Khoroo");

// DEFUALT DATAS
const sortDefualt = { createAt: -1 };

exports.fixPolygons = asyncHandler(async (req, res) => {
  try {
    // Полигоныг хайх
    const polygons = await Polygon.find({
      "geometry.type": { $in: ["Polygon", "MultiPolygon"] },
    });

    for (const polygonDoc of polygons) {
      const polygon = turf.polygon(polygonDoc.geometry.coordinates);

      // Полигоныг шалгах
      const isValid = turf.booleanClockwise(polygon);
      if (!isValid) {
        console.log("Полигон формат алдаатай:", polygonDoc._id);

        // Зассан полигоныг үүсгэх
        const fixedPolygon = turf.polygon(turf.getCoords(polygon).reverse());

        // Зассан полигоныг хадгалах
        await Polygon.updateOne(
          { _id: polygonDoc._id },
          {
            $set: { "geometry.coordinates": fixedPolygon.geometry.coordinates },
          }
        );
      }
    }
    res.status(200).json({ message: "All polygons fixed successfully!" });
  } catch (error) {
    console.error("Полигоныг засахад алдаа:", error);
    res.status(500).json({ message: "Error fixing polygons" });
  }
});

function fixEncoding(str) {
  return iconv.decode(Buffer.from(str, "binary"), "utf-8");
}

const fixCoordinates = (coords) => {
  if (Array.isArray(coords)) {
    return coords.map((coord) => fixCoordinates(coord));
  }
  return parseFloat(coords); // String байвал Number рүү хөрвүүлнэ
};

// Полигон өгөгдлийг засах

exports.updateWord = asyncHandler(async (req, res) => {
  // const findValue = "Ѭ";
  // const replaceValue = "р";
  // // Шаардлагатай Polygon-уудыг сонгоно
  // const polygons = await Polygon.find({
  //   "properties.name": { $regex: findValue },
  // }).select("properties");
  // for (let polygon of polygons) {
  //   if (polygon.properties && polygon.properties.name) {
  //     // properties.name доторх утгыг солих
  //     const updatedName = polygon.properties.name.replace(
  //       findValue,
  //       replaceValue
  //     );
  //     // Өөрчлөлтүүдийг хадгалах
  //     await Polygon.updateOne(
  //       { _id: polygon._id },
  //       { $set: { "properties.name": updatedName } }
  //     );
  //   }
  // }
  // // for (let polygon of polygons) {
  // //   if (polygon.properties && polygon.properties.name) {
  // //     // properties.name доторх утгыг солих
  // //     const updatedName = polygon.properties.name
  // //       .replace(/(^|\s)��/g, "И")
  // //       .replace(/��/g, "ш");
  // //     // Polygon-г шууд шинэчлэх
  // //     await Polygon.updateOne(
  // //       { _id: polygon._id },
  // //       { $set: { "properties.name": updatedName } }
  // //     );
  // //     console.log(`Polygon ${polygon._id} updated successfully.`);
  // //   }
  // // }
  // const polygons = await Polygon.find({
  //   "properties.code": { $regex: /^\d{7}$/ },
  // }).select("properties");
  // for (let polygon of polygons) {
  //   const cityPolygon = await Polygon.findOne({})
  //     .where("properties.code", polygon.properties.au1_code)
  //     .select("_id");
  //   if (!cityPolygon) {
  //     console.log(`Polygon with code ${polygon.properties.au1_code} not found`);
  //     continue;
  //   }
  //   const districtPolygon = await Polygon.findOne({})
  //     .where("properties.code", polygon.properties.au2_code)
  //     .select("_id");
  //   if (!districtPolygon) {
  //     console.log(`Polygon with code ${polygon.properties.au1_code} not found`);
  //     continue;
  //   }
  //   // Холбоотой City-г олж авна
  //   const city = await City.findOne()
  //     .where("polygon", cityPolygon._id)
  //     .select("_id");
  //   if (!city) {
  //     console.log(`City for Polygon ${city._id} not found`);
  //     continue;
  //   }
  //   const district = await District.findOne()
  //     .where("polygon", districtPolygon._id)
  //     .select("_id");
  //   if (!district) {
  //     console.log(`district for Polygon ${district._id} not found`);
  //     continue;
  //   }
  //   // console.log(city);
  //   // Шинэ District үүсгэнэ
  //   const data = {
  //     name: polygon.properties.name,
  //     engName: slugify(polygon.properties.name),
  //     polygon: polygon._id,
  //     cityProvince: city._id,
  //     district: district._id,
  //   };
  //   await Khoroo.create(data);
  //   console.log(`Khoroo created: ${data.name}`);
  // }
  // res.status(200).json({ polygons });
});

exports.coordinateSearch = asyncHandler(async (req, res) => {
  const { location, radius } = req.query;

  if (!location) {
    throw new MyError("Байршлын координатыг оруулна уу", 400);
  }

  const coordinate = location.split(",");
  const lat = parseFloat(coordinate[0]);
  const lng = parseFloat(coordinate[1]);

  if (isNaN(lat) || isNaN(lng)) {
    throw new MyError("Уртраг, өргөргийн утгыг зөв форматтай оруулна уу", 400);
  }

  const maxRadius = radius ? parseInt(radius, 10) : 50;

  const point = {
    type: "Point",
    coordinates: [lng, lat], // Шалгах гэж буй цэгийн координат
  };

  const result = await Polygon.aggregate([
    {
      match: {
        "geometry.coordinates": {
          $geoIntersects: {
            $geometry: point,
          },
        },
      },
    },
    {
      $lookup: {
        from: "Polygon",
        localField: "properties.au1_code",
        foreignField: "properties.code",
        as: "au1Code",
      },
    },
    {
      $lookup: {
        from: "Polygon",
        localField: "properties.au2_code",
        foreignField: "properties.code",
        as: "au2Code",
      },
    },
    {
      $project: {
        _id: 1,
        geometry: 1,
        properties: 1,
        // au1Code: 1,
        // au2Code: 1,
      },
    },
  ]);

  res.status(200).json({ result });
});

exports.createPolygon = asyncHandler(async (req, res) => {
  const files = req.files;
  const { dbfFile, shpFile } = files;

  if (!dbfFile || !shpFile) {
    return res.status(400).send(".dbf болон .shp файлуудаа оруулна уу");
  }

  const shpBuffer = Buffer.from(shpFile.data);
  const dbfBuffer = Buffer.from(dbfFile.data);

  try {
    const source = await shapefile.open(shpBuffer, dbfBuffer);
    const features = [];
    let result;

    while (!(result = await source.read()).done) {
      const feature = result.value;
      feature.createUser = req.userId;
      feature.properties.name = fixEncoding(feature.properties.name.toString());
      features.push(feature);
    }

    const fixedFeatures = features.map((feature) => {
      if (feature.geometry) {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates:
              feature.geometry && fixCoordinates(feature.geometry.coordinates),
          },
        };
      } else {
        return {
          ...feature,
          geometry: {
            type: "Polygon",
            coordinates: [],
          },
        };
      }
    });

    // Гео мэдээллийг MongoDB-д хадгалах
    await Polygon.insertMany(fixedFeatures);

    res.status(200).json({ message: "Polygon data saved successfully" });
  } catch (error) {
    console.error("Error processing shapefile:", error);
    res.status(500).send("Error processing shapefile");
  }
});

exports.getPolygons = asyncHandler(async (req, res) => {
  const userInput = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || sortDefualt;
  const select = req.query.select || null;

  //Fields
  const { createUser, updateUser, createAt, updateAt } = userInput;

  const query = Polygon.find();
  const searchFields = ["name", "code", "au1_code", "au2_code", "area_m2"];

  searchFields.map((el) => {
    if (valueRequired(userInput[el])) {
      let searchQuery = {};
      searchQuery[`properties.${el}`] = RegexOptions(userInput[el]);
      query.find(searchQuery);
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(sort))
    query.sort(sortBuild(`properties.${sort}`, sortDefualt));

  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.countDocuments();

  const pagination = await paginate(page, limit, Polygon, result);
  if (select) query.select(select);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const datas = await query.exec();

  res.status(200).json({
    success: true,
    count: datas.length,
    data: datas,
    pagination,
  });
});

exports.multDeletePolygon = asyncHandler(async (req, res) => {
  const ids = req.queryPolluted.id;
  const finds = await Polygon.find({ _id: { $in: ids } });

  if (finds.length <= 0) throw new MyError("Өгөгдөлүүд олдсонгүй", 404);

  await Polygon.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getPolygon = asyncHandler(async (req, res) => {
  const polygon = await Polygon.findById(req.params.id);

  if (!polygon) throw new MyError("Өгөгдөл олдсонгүй");

  res.status(200).json({
    success: true,
    data: polygon,
  });
});

exports.updatePolygon = asyncHandler(async (req, res) => {
  let polygon = await Polygon.findById(req.params.id);
  if (!polygon) throw new MyError("Өгөгдөл олдсонгүй", 404);
  req.body.properties = {};
  const datas = [
    { key: "name", value: req.body.name },
    { key: "area_m2", value: req.body.area_m2 },
    { key: "au1_code", value: req.body.au1_code },
    { key: "au2_code", value: req.body.au2_code },
    { key: "code", value: req.body.code },
  ];

  datas.forEach((data) => {
    req.body.properties[data.key] = data.value;
  });

  console.log(req.body);

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  polygon = await Polygon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: polygon,
  });
});
