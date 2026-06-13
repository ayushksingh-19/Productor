const express = require("express");
const {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  updateProductStatus,
} = require("../controllers/productController");
const { imageUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listProducts);
router.post("/", imageUpload.array("images", 5), createProduct);
router.put("/:productId", imageUpload.array("images", 5), updateProduct);
router.patch("/:productId/status", updateProductStatus);
router.delete("/:productId", deleteProduct);

module.exports = router;
