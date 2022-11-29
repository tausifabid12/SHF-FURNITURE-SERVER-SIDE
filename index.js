const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middle ware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// ************ connecting mongodb **************** \\

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.brxmqep.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function dbConnect() {
  try {
    client.connect();
    console.log("data base connected");
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
}

dbConnect();

// ************ collections **************** \\
const Category = client.db("Furniture").collection("Category");
const Products = client.db("Furniture").collection("Products");
const Users = client.db("Furniture").collection("Users");
const Bookings = client.db("Furniture").collection("Bookings");
const Reports = client.db("Furniture").collection("Reports");

// ************ apis **************** \\

app.get("/", (req, res) => {
  res.send("Furniture server is up");
});

//********* jwt apis ***********//

app.get("/jwt", async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await Users.findOne(query);
  if (user) {
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
      expiresIn: "1d",
    });
    return res.send({ accessToken: token });
  }
  res.status(403).send({ accessToken: "" });
});

//********* category apis ***********//

//getting category
app.get("/category", async (req, res) => {
  try {
    const query = {};
    const categories = await Category.find(query).toArray();
    res.send({
      result: true,
      data: categories,
      message: "categories",
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//********* products apis ***********//

//getting products
app.get("/products", async (req, res) => {
  try {
    const query = {};
    const products = await Products.find(query).toArray();
    res.send({
      result: true,
      data: products,
      message: "products",
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//getting products with category
app.get("/products/:cat", async (req, res) => {
  try {
    const cat = req.params.cat;
    const query = { category: cat };
    const filteredProducts = await Products.find(query).toArray();
    res.send({
      result: true,
      data: filteredProducts,
      message: `${cat} products`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});
//getting products with id
app.get("/products/item/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const filteredProducts = await Products.findOne(query);
    res.send({
      result: true,
      data: filteredProducts,
      message: `${id} product  details`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//getting user's products
app.get("/userProducts", verifyJWT, async (req, res) => {
  try {
    const email = req.query.email;
    const query = { email: email };
    const filteredProducts = await Products.find(query).toArray();
    res.send({
      result: true,
      data: filteredProducts,
      message: `${email} products`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//getting advertise  products
app.get("/advertise", verifyJWT, async (req, res) => {
  try {
    const query = {
      advertise: true,
    };
    const filteredProducts = await Products.find(query).toArray();
    res.send({
      result: true,
      data: filteredProducts,
      message: `advertise products`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//adding products
app.post("/products", async (req, res) => {
  try {
    const productInfo = req.body;
    console.log(productInfo);
    const addProduct = await Products.insertOne(productInfo);

    res.send({
      result: true,
      data: addProduct,
      message: `Product added`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//setting advertise products

app.put("/products", async (req, res) => {
  try {
    const id = req.query.id;
    const body = req.body;

    const filter = { _id: ObjectId(id) };
    const updateDoc = {
      $set: { advertise: body.advertise },
    };
    const result = await Products.updateOne(filter, updateDoc);
    res.send({
      result: true,
      data: result,
      message: "updated",
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

app.delete("/delete/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };

    const result = await Products.deleteOne(filter);

    res.send({
      result: true,
      data: result,
      message: `user  deleted`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//********* users apis ***********//
//getting all users
app.get("/users", verifyJWT, async (req, res) => {
  try {
    let filter = {};
    const role = req.query.role;
    if (role) {
      filter = { role: role };
    }

    const users = await Users.find(filter).toArray();
    res.send({
      result: true,
      data: users,
      message: `users`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//getting single user info
app.get("/usersInfo", async (req, res) => {
  try {
    const email = req.query.email;
    filter = { email: email };
    const user = await Users.findOne(filter);
    res.send({
      result: true,
      data: user,
      message: `users`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//creating  users
app.post("/users", async (req, res) => {
  try {
    const userInfo = req.body;
    const setUser = await Users.insertOne(userInfo);

    res.send({
      result: true,
      data: setUser,
      message: `users`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//update users
app.put("/user/verified", verifyJWT, async (req, res) => {
  try {
    const id = req.query.id;
    const filter = { _id: ObjectId(id) };
    const updateDoc = {
      $set: { verified: true },
    };

    const setUser = await Users.updateOne(filter, updateDoc);

    res.send({
      result: true,
      data: setUser,
      message: `users`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//delete user

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };

    const result = await Users.deleteOne(filter);

    res.send({
      result: true,
      data: result,
      message: `user  deleted`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//********* booking apis ***********//

//getting user's booking information
app.get("/booking/user", verifyJWT, async (req, res) => {
  try {
    const email = req.query.email;
    const filter = { email: email };
    const userBooking = await Bookings.find(filter).toArray();
    res.send({
      result: true,
      data: userBooking,
      message: `bookings of user`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

//getting all booking information
app.get("/booking", async (req, res) => {
  try {
    let filter = {};
    const booking = await Bookings.find(filter).toArray();
    res.send({
      result: true,
      data: booking,
      message: `all booking info`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});
//storing booking info
app.post("/booking", async (req, res) => {
  try {
    const bookingInfo = req.body;
    const saveBookingInfo = await Bookings.insertOne(bookingInfo);

    res.send({
      result: true,
      data: saveBookingInfo,
      message: `booking added successfully`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

///* deleting bookings
app.delete("/delete/booking/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await Bookings.deleteOne(query);

    res.send({
      result: true,
      data: result,
      message: `Product added`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});
//********* report apis ***********//

app.get("/report", verifyJWT, async (req, res) => {
  try {
    let filter = {};
    const reports = await Reports.find(filter).toArray();
    res.send({
      result: true,
      data: reports,
      message: `all booking info`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});
app.post("/report", async (req, res) => {
  try {
    const reportInfo = req.body;
    const result = await Reports.insertOne(reportInfo);

    res.send({
      result: true,
      data: result,
      message: `Report added`,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

app.delete("/delete/report/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await Reports.deleteOne(query);

    res.send({
      result: true,
      data: result,
      message: ``,
    });
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      result: false,
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log("server is running");
});
