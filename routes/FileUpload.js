const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  imgUpload,
  uploadFile,
  removeImage,
  removeFile,
} = require("../controller/Files");

router.route("/imgupload").post(protect, authorize("admin"), imgUpload);
router.route("/imgupload").delete(protect, authorize("admin"), removeImage);
router.route("/file").post(protect, authorize("admin"), uploadFile);
router.route("/file").delete(protect, authorize("admin"), removeFile);

module.exports = router;
