const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
    proTitle:String,
    proDescription:String,
    proPrice:Number,
    imgPath:String

})
const Product = mongoose.model("Product",productSchema)

module.exports = Product