const Product = require("../models/Product");

const seedProducts = [
  {
    brandName: "CakeZone",
    images: ["/media-assets/brownie-walnut.svg"],
    isExchangeable: true,
    mrp: 2000,
    name: "CakeZone Walnut Brownie",
    quantity: 200,
    sellingPrice: 1500,
    status: "unpublished",
    type: "Foods",
  },
  {
    brandName: "CakeZone",
    images: ["/media-assets/choco-fudge.svg"],
    isExchangeable: true,
    mrp: 2300,
    name: "CakeZone Choco Fudge Brownie",
    quantity: 200,
    sellingPrice: 2000,
    status: "unpublished",
    type: "Foods",
  },
  {
    brandName: "Theobroma",
    images: ["/media-assets/christmas-cake.svg"],
    isExchangeable: true,
    mrp: 2300,
    name: "Theobroma Christmas Cake",
    quantity: 200,
    sellingPrice: 1800,
    status: "unpublished",
    type: "Foods",
  },
];

async function seedDatabase() {
  const existingProducts = await Product.countDocuments();

  if (existingProducts === 0) {
    await Product.insertMany(seedProducts);
    console.log("Seeded sample products.");
  }
}

module.exports = { seedDatabase };
