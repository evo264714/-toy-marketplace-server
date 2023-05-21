const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmw7zrv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('toyMarket').collection('toys');

    // const indexKeys = { toyName: 1 };
    // const indexOptions = { name: "toyName" }
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);

    // app.get('/toySearchByName/:text', async (req, res) => {
    //   const searchText = req.params.text;

    //   const result = await toysCollection.find({
    //     toyName: { $regex: searchText, $options: 'i' },


    //   }).toArray()
    //   res.send(result)
    // })


    app.get('/toys', async (req, res) => {

      const category = req.query.category;
      let query = { subcategoryName: category };
      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/addToy', async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await toysCollection.insertOne(body);
      res.send(result)
    })

    app.get('/allToys', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const result = await toysCollection.find({}).limit(limit).toArray();
      res.send(result);
    })
    app.get('/myToys', async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/myToys/:email', async (req, res) => {
      const result = await toysCollection.find({ sellerEmail: req.params.email }).toArray();
      res.send(result)
    })

    app.get('/toyDetails', async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })

    //Update
    app.get('/updateToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toysCollection.findOne(query)
      res.send(result);
    })
    app.put('/updateToys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedToys = req.body
      const toys = {
        $set: {
          price: updatedToys.price,
          availableQuantity: updatedToys.availableQuantity,
          description: updatedToys.description
        }
       
      }
      const result = await toysCollection.updateOne(filter, toys, options)
      res.send(result);
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Toy market is running")
})

app.listen(port, () => {
  console.log(`Toy marketplace is running on port: ${port}`);
})