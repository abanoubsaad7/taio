const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username: String,
    Number:String,
    password:String,
    admin:Boolean,

});
const User = mongoose.model("User",userSchema);

module.exports = User;