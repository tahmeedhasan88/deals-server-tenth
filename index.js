const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, Db } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;


//middleware
app.use(cors());
app.use(express.json())


const uri = "mongodb+srv://dealsServerDbUser:zrA7dQjmyK5MY916@cluster0.ro9lg2o.mongodb.net/?appName=Cluster0";



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

     await client.connect();

     const database = client.db('deals_db');
     const productsCollection = database.collection('product')
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

     app.post('/products', async(req, res) => {
         
        const newProducts = req.body;
        const result = await productsCollection.insertOne(newProducts);
        res.send(result);

     })


     app.post('/orders', async(req, res) => {
      const newOrders = req.body;
      const result = await productsCollection.insertOne(newOrders)
      
      res.send(result)
     })


     app.delete('/products/:id', async(req, res) => {

        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await productsCollection.deleteOne(query);
        res.send(result)


     })

     app.get('/orders', async(req, res) =>{

      const email = req.query.email
      const query = {};

      if(email){

         query.email = email;
      }

      

      const cursor = ordersCollection.find(query)
      const result = await  cursor.toArray()
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



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  }finally{
   
   

  }


}
run().catch(console.dir)


app.listen(port, ()=>{
    console.log(`My server is running on port: ${port} `)
})