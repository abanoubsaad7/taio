//  to controll ur website
//build app settings start point
const express = require("express");
const app = express();
const port = 7500;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
//da esm el model schema bta3na
const User = require("./models/userSchema");
const Product = require("./models/productSchema");
const ProductUser = require("./models/productUserSchema");
//set up for uploads files
const formidable = require('formidable');
const form = formidable({ multiples: true });
const fs = require('fs');
const mv = require('mv');
const path = require('path');
// const util = require('util')
// const EventEmitter = require('events')
let UserInstance = null;
// function MyClass() { EventEmitter.call(this) }
// util.inherits(MyClass, EventEmitter)
//body parser types
const bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: true })
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

 //for uplouded files&images and multer set up
// const multer  = require('multer')
// const upload = multer()
// mongoose
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://AbanoubSaad:dev@cluster0.yoqimye.mongodb.net/knysa?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.log(err);
  });
  
app.get("/", (req, res) => {
  res.redirect("/index");
});

app.get("/index", (req, res) => {
  res.render("index", { myTitle: "اسرة مارجرجس اعدادي" });
});

app.get("/register", (req, res) => {
  res.render("register", { myTitle: "sign up" });
});

app.get("/login", (req, res) => {
  res.render("login", { myTitle: "log in" });
});

app.get("/add-new-pro", (req, res) => {
  res.render("add-new-pro", { myTitle: "add new pro" });
});

app.get("/manage-users", (req, res) => {
  User.find()
    .then((result) => {
      res.render("manage-users", { myTitle: " التحكم بالمستخدم  ",arrUser:result });
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get('/deleteUSer/:id', (req, res) => {
  User.findById(req.params.id)
  .then((result)=>{
    res.render('user-delete',{ myTitle:' مسح المستخدم ', objUser:result })
  })
  .catch((err) => {
    console.log(err);
  })
})
app.post("/profile", function (req, res) {
  const newUser = new User(req.body);

  newUser
    .save()
    .then((result) => {
      res.redirect("/product");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/login', function (req, res) {

  const username = req.body.username;
   const password = req.body.password;
  
  User.findOne({username:username ,password:password}, (err,user)=>{
   let errmsg ="the username or password is wrong"
    if(!err){
      if (user){
        UserInstance = user;
        if( user.admin == true){
          res.redirect("/product-admin")
          console.log("helloooooooz");
        } else{
          res.redirect("/product")
        } return
      }
    }
    console.log(errmsg);
    res.redirect("/login");
    
    
  })
})

app.post("/product", function (req, res) {
  const product = new Product(req.body);
  product
    .save()
    .then((result) => {
      const resultID = result._id.toString();
      res.send({"Id": resultID})
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/productImage/:Id", function (req, res) {
  const form = new formidable.IncomingForm();
  
  form.parse(req, function (err, fields, files) { 
    const oldpath = files.proImg.filepath;
    let newpath = './public/productImg/' + files.proImg.originalFilename;
    const type = path.extname(newpath)
    newpath = './public/productImg/' + req.params.Id+type;
    mv(oldpath, newpath , function(err) {
      if (err) throw err;
    });
    Product.updateOne({_id: req.params.Id}, {imgPath:req.params.Id+type}, function (err, docs){
      console.log("the product image was uploaded successfully");
      res.redirect("/product-admin");
    });
  });
});

app.get("/product", (req, res) => {
  Product.find()
    .then((result) => {
      res.render("product", { myTitle: " الهدايا ",arrProduct:result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/product-admin', (req, res) => {
  Product.find()
  .then((result) => {
    res.render("product-admin", { myTitle: " products ",arrProduct:result });
  })
  .catch((err) => {
    console.log(err);
  });
})

app.get("/manage", (req, res) => {
  Product.find()
    .then((result) => {
      res.render("manage", { myTitle: " التحكم بالهدايا  ",arrProduct:result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/product/:id', (req, res) => {
  Product.findById(req.params.id)
  .then((result)=>{
    console.log(UserInstance)
    if (UserInstance.admin == null || UserInstance.admin == false)
    {
      res.render('proDetails',{ myTitle:' تفاصيل الهدية ', objProduct:result});
      return
    }
    let productRuslt = result;
    ProductUser.find({ productID: req.params.id }).then( async (result) => {
      let AllUsers = []
      console.log(result)
      for(i=0;i<result.length;i++) {
        element = result[i]
        console.log(element)
        result = await User.findOne(element.userID);
        AllUsers.push(result)
      }
      console.log(AllUsers)
      res.render("proDetails-admin", { Users: AllUsers, objProduct: productRuslt ,myTitle:"users who choose this product" });
    });
  })
  .catch((err) => {
    console.log(err);
  })
})

app.get('/deleteProduct/:id', (req, res) => {
  Product.findById(req.params.id)
  .then((result)=>{
    res.render('product-delete',{ myTitle:' مسح الهدية ', objProduct:result })
  })
  .catch((err) => {
    console.log(err);
  })
})

app.get('/updateProduct/:id', (req, res) => {
  Product.findByIdAndUpdate(req.params.id,req.body)
  .then((result)=>{
    res.render('update-product',{ myTitle:' تعديل الهدية ', objProduct:result })
  })
  .catch((err) => {
    console.log(err);
  })
})

app.post('/Buy/:Id', (req, res) => {
  // console.log(UserInstance._id);
  Id = mongoose.Types.ObjectId(req.params.Id);
  ProductUser.find({ userID: UserInstance._id, productID: Id }).then((result) => {
    if (result.length == 0) {
      const productUser = new ProductUser({
        userID: UserInstance._id,
        productID: Id,
      });
      console.log(productUser);
      productUser
        .save()
        .then((result) => {
          res.redirect("/product");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.redirect("/product");
    }
  })
  
})

app.delete('/product/:id',  (req, res) => {
  //eldata inside el json btt5zn fy var data inside details.ejs
  Product.findByIdAndDelete(req.params.id)
      .then((params) => { res.json({ myLink: "/manage" }) })
      .catch((err) => {
          console.log(err);
      });
});

app.delete('/user/:id',  (req, res) => {
  //eldata inside el json btt5zn fy var data inside details.ejs
  User.findByIdAndDelete(req.params.id)
      .then((params) => { res.json({ myLink: "/manage-users" }) })
      .catch((err) => {
          console.log(err);
      });
});