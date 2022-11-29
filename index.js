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

app.listen(port, () => {
  console.log("server is running");
});
