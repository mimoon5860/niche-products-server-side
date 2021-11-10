const express = require("express");
const cors = require("cors")
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ln5bf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri);

async function run() {

    // Database Collections 
    const database = client.db("nicheProducts");
    const productCollection = database.collection("products");


    // Get All Product API 
    try {
        app.get('/products', async (req, res) => {
            await client.connect();
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })
    }
    finally {
        await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Niche Server Running...')
})
app.listen(port, () => {
    console.log('listening to port', port)
})