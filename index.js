const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://deals-server-tenth.web.app",
      "https://deals-server-tenth.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ro9lg2o.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // MUST connect in Vercel
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("deals_db");
    const productsCollection = database.collection("product");
    const ordersCollection = database.collection("orders");
    const userCollection = database.collection("users");

    // ROOT ROUTE
    app.get("/", (req, res) => {
      res.send("My server is running");
    });

    // USER POST
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // GET PRODUCTS
    app.get("/products", async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { email } : {};
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch products", error });
      }
    });

    // GET RECENT LISTINGS
    app.get("/recent-listings", async (req, res) => {
      const cursor = productsCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET PRODUCT BY ID
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // GET ORDERS
    app.get("/orders", async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { email } : {};
        const result = await ordersCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch orders", error });
      }
    });

    // DELETE ORDER
    app.delete("/orders/:id", async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid order ID" });
        }

        const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Order not found" });
        }

        res.send({ message: "Order deleted successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Failed to delete order", error });
      }
    });

    // ADD PRODUCT
    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    // ADD ORDER
    app.post("/orders", async (req, res) => {
      const newOrders = req.body;
      const result = await ordersCollection.insertOne(newOrders);
      res.send(result);
    });

    // DELETE PRODUCT
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // UPDATE PRODUCT
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;

      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };

      const result = await productsCollection.updateOne(
        { _id: new ObjectId(id) },
        update
      );

      res.send(result);
    });
  } finally {}
}

run().catch(console.error);

// For Vercel — DO NOT USE app.listen()
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
}

module.exports = app;
