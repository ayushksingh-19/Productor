function serializeProduct(product) {
  return {
    brandName: product.brandName,
    createdAt: product.createdAt,
    id: product._id.toString(),
    images: product.images,
    isExchangeable: product.isExchangeable,
    mrp: product.mrp,
    name: product.name,
    quantity: product.quantity,
    sellingPrice: product.sellingPrice,
    status: product.status,
    type: product.type,
    updatedAt: product.updatedAt,
  };
}

function serializeUser(user) {
  return {
    displayName: user.displayName,
    id: user._id.toString(),
    identifier: user.identifier,
  };
}

module.exports = { serializeProduct, serializeUser };
