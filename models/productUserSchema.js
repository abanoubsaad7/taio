const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productUserSchema = new Schema ({
    userID:mongoose.Types.ObjectId,
    productID:mongoose.Types.ObjectId

});
const ProductUser = mongoose.model("productsUsers",productUserSchema);

module.exports = ProductUser;