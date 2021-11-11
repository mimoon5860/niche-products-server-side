const express = require("express");
const cors = require("cors")
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ln5bf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {

    // Database Collections 
    const database = client.db("nicheProducts");
    const productCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");


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


    // Get Single Product by Id 
    try {
        app.get('/product/:id', async (req, res) => {
            await client.connect();
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })
    }
    finally {
        await client.close();
    }


    // Post an user api
    try {
        app.post('/user', async (req, res) => {
            await client.connect();
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.json(result);
        })
    }
    finally {
        await client.close();
    }

    // Put an user api 
    try {
        app.put('/user', async (req, res) => {
            await client.connect();
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
    }
    finally {
        await client.close();
    }

    // Post order api 
    try {
        app.post('/orders', async (req, res) => {
            await client.connect();
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.json(result);
        })
    }
    finally {
        await client.close();
    }


    // Get order all-order/users-order 
    try {
        app.get('/orders', async (req, res) => {
            await client.connect();
            const email = req.query.email;
            if (email) {
                const query = {
                    email: email
                }
                const order = await orderCollection.find(query).toArray();
                res.send(order);
            } else {
                const cursor = orderCollection.find({});
                const orders = await cursor.toArray();
                res.send(orders);
            }

        })
    }
    finally {
        await client.close();
    }


    // Admin Confirmation 
    try {
        app.get('/user/:email', async (req, res) => {
            await client.connect();
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
    }
    finally {
        await client.close();
    }


    // Make an Admin 
    try {
        app.put('/user/admin', async (req, res) => {
            await client.connect();
            const user = req.body;
            const adminEmail = user.admin;
            const newAdmin = user.newAdmin;
            if (adminEmail) {
                const admin = await usersCollection.findOne({ email: adminEmail });
                if (admin?.role === 'admin') {
                    const filter = { email: newAdmin };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                } else {
                    res.status(403).json({ message: 'you do not have access to make admin' })
                }
            }

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