const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId, Db } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;


//middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://deals-server-tenth.web.app", "https://deals-server-tenth.vercel.app"],
  credentials: true
}));



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ro9lg2o.mongodb.net/?appName=Cluster0` ;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/', (req, res) => {
  res.send('My server is running')
})


async function run(){
  try{

     

     const database = client.db('deals_db')
     const productsCollection = database.collection('product');
     const ordersCollection = database.collection('orders');
     const userCollection = database.collection('users');


     app.post('/users', async(req,res)=>{

      const newUser = req.body;
      const result = await userCollection.insertOne(newUser)
      res.send(result);

     })



     app.get('/products', async(req,res) => {

      console.log(req.query)
      const email = req.query.email;
      const query = {}
      if(email){

         query.email = email 
      }

        const cursor = productsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)

     })

     app.get('/recent-listings', async(req,res)=>{

          const cursor = productsCollection.find().sort({date: -1}).limit(6);
          const result = await cursor.toArray();
          res.send(result)

     })


     app.get('/products/:id', async(req,res) =>{

        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await productsCollection.findOne(query);
        res.send(result)
     })

//This portion is for my order page
// Get Orders 
app.get('/orders', async (req, res) => {
  try {
    const email = req.query.email;
    const query = email ? { email } : {};  

    const result = await ordersCollection.find(query).toArray();
    res.send(result);

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ message: "Failed to fetch orders", error });
  }
});


// Delete an Order
app.delete('/orders/:id', async (req, res) => {
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
    console.error("Error deleting order:", error);
    res.status(500).send({ message: "Failed to delete order", error });
  }
});
//---------------------------------


//This portion is for my listing

app.get('/products', async (req, res) => {
  try {
    const email = req.query.email;
    const query = email ? { email } : {};  // Clean query handling

    const result = await productsCollection.find(query).toArray();
    res.send(result);

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ message: "Failed to fetch orders", error });
  }
});



// DELETE /orders/:id
app.delete('/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid order ID" });
    }

    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Order not found" });
    }

    res.send({ message: "Order deleted successfully", deletedCount: result.deletedCount });

  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send({ message: "Failed to delete order", error });
  }
});




//---------------------------------------






 app.post('/products', async(req, res) => {
         
        const newProducts = req.body;
        const result = await productsCollection.insertOne(newProducts);
        res.send(result);

     })


 app.post('/orders', async(req, res) => {
      const newOrders = req.body;
      const result = await ordersCollection.insertOne(newOrders)
      
      res.send(result)
     })


     app.delete('/products/:id', async(req, res) => {

        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await productsCollection.deleteOne(query);
        res.send(result)


     })



     app.patch('/products/:id', async(req, res) => {

        const id = req.params.id;
        const updatedProduct = req.body;
        const query = {_id: new ObjectId(id)}
        const update = {

            $set:{
                name: updatedProduct.name,
                price: updatedProduct.price

            }
        }
        const result = await productsCollection.updateOne(query, update)
        res.send(result)

     })



    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  }finally{}


}
run().catch(console.dir)


app.listen(port, ()=>{
    console.log(`My server is running on port: ${port} `)
})