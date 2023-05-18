const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uprfadf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();

    const toysCollection = client.db("kidToysDB").collection("allToys");

    //allToys Routes
    app.get("/all-toys", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.post("/all-toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    // Single Toy Routes
    app.get("/toy-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // filter by category
    app.get("/subcategory/:id", async (req, res) => {
      const category = req.params.id;
      const filter = { subcategory: category };
      const options = {
        projection: { name: 1, price: 1, pictureURL: 1, rating: 1 },
      };
      const result = await toysCollection.find(filter, options).toArray();
      res.send(result);
    });

    //update by id
    app.patch("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const toy = req.body;
      const updatedToy = {
        $set: {
          ...toy,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedToy);
      res.send(result);
    });

    // delete by id
    app.delete("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The curious kids server is running");
});

app.listen(port, () => {
  console.log(`The server listening on port ${port}`);
});
