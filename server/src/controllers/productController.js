const Product = require("../models/Product");
const { createHttpError, toRelativeUploadPath } = require("../utils/helpers");
const { serializeProduct } = require("../utils/serializers");

function readText(value) {
  return String(value || "").trim();
}

function readNumber(value, label) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw createHttpError(400, `${label} must be a valid positive number.`);
  }

  return numberValue;
}

function readExchangeValue(value) {
  return String(value).toLowerCase() === "true" || value === true || value === "Yes";
}

function getProductPayload(body) {
  const name = readText(body.name);
  const type = readText(body.type);
  const brandName = readText(body.brandName);

  if (!name) {
    throw createHttpError(400, "Please enter product name.");
  }

  if (!type) {
    throw createHttpError(400, "Please select product type.");
  }

  if (!brandName) {
    throw createHttpError(400, "Please enter brand name.");
  }

  return {
    name,
    type,
    brandName,
    quantity: readNumber(body.quantity, "Quantity stock"),
    mrp: readNumber(body.mrp, "MRP"),
    sellingPrice: readNumber(body.sellingPrice, "Selling price"),
    isExchangeable: readExchangeValue(body.isExchangeable),
  };
}

function getExistingImages(value, fallbackImages) {
  if (!value) {
    return fallbackImages;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallbackImages;
  } catch {
    return fallbackImages;
  }
}

async function listProducts(req, res, next) {
  try {
    const { search = "", status = "all" } = req.query;
    const filters = {};

    if (status === "published" || status === "unpublished") {
      filters.status = status;
    }

    if (search) {
      const searchPattern = new RegExp(search.trim(), "i");
      filters.$or = [
        { brandName: searchPattern },
        { name: searchPattern },
        { type: searchPattern },
      ];
    }

    const products = await Product.find(filters).sort({ createdAt: -1 });
    res.json({ products: products.map(serializeProduct) });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const fields = getProductPayload(req.body);
    const images = (req.files || []).map((file) => toRelativeUploadPath(file.filename));

    const product = await Product.create({
      ...fields,
      images,
      status: "unpublished",
    });

    res.status(201).json({
      message: "Product added successfully.",
      product: serializeProduct(product),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      throw createHttpError(404, "Product not found.");
    }

    const fields = getProductPayload(req.body);
    const retainedImages = getExistingImages(req.body.existingImages, product.images);
    const uploadedImages = (req.files || []).map((file) => toRelativeUploadPath(file.filename));

    product.set({
      ...fields,
      images: [...retainedImages, ...uploadedImages],
    });

    await product.save();

    res.json({
      message: "Product updated successfully.",
      product: serializeProduct(product),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProductStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (status !== "published" && status !== "unpublished") {
      throw createHttpError(400, "Status must be published or unpublished.");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { status },
      { new: true },
    );

    if (!product) {
      throw createHttpError(404, "Product not found.");
    }

    res.json({
      message:
        status === "published"
          ? "Product published successfully."
          : "Product moved to unpublished successfully.",
      product: serializeProduct(product),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      throw createHttpError(404, "Product not found.");
    }

    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  updateProductStatus,
};
