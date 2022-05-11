const express = require("express")
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config()
const cors = require("cors")


const app = express()
const port = process.env.PORT || 8000
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6doss.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        client.connect()
        const database = client.db("squadrone")
        const productsCollection = database.collection("products")
        const usersCollection = database.collection("users")
        const ordersCollection = database.collection("orders")
        const reviewsCollection = database.collection("reviews")
        const blogsCollection = database.collection("blogs")
        const clientsCollection = database.collection("clients")

        // Get All Blogs
        app.get("/blogs", async(req, res) => {
                const result = await blogsCollection.find({}).toArray()
                res.send(result)
            })
            // Get All Client Logo
        app.get("/clients", async(req, res) => {
                const result = await clientsCollection.find({}).toArray()
                res.send(result)
            })
            // Get All Products
        app.get("/products", async(req, res) => {
                const result = await productsCollection.find({}).toArray()
                res.send(result)
            })
            // Get Single Product
        app.get("/products/:productId", async(req, res) => {
                const productId = req.params.productId
                const filter = { _id: ObjectId(productId) }
                const result = await productsCollection.findOne(filter)
                res.send(result)
            })
            // Add Product
        app.post("/products", async(req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.json(result)
        })

        // Delete a Product
        app.delete("/products/:productId", async(req, res) => {
                const product = req.params.productId
                const query = { _id: ObjectId(product) }
                const result = await productsCollection.deleteOne(query)
                res.json(result)
            })
            // Insert User
        app.post("/users", async(req, res) => {
                const user = req.body
                const result = await usersCollection.insertOne(user)
                res.json(result)
            })
            // Make Admin
        app.get("/user", async(req, res) => {
            const user = req.query.email
            const filter = { userEmail: user }
            const result = await usersCollection.findOne(filter)
            let isAdmin = false;
            if (result.role === "Admin") {
                isAdmin = true;
            }
            res.send({ result, isAdmin })
        })
        app.put("/admin", async(req, res) => {
            const email = req.body.userEmail
            const filter = { userEmail: email }
            const updateDoc = { $set: { role: "Admin" } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        app.delete("/orders/:orderId", async(req, res) => {
            const orderId = req.params.orderId
            const filter = { _id: ObjectId(orderId) }
            const result = await ordersCollection.deleteOne(filter)
            res.json(result)
        })
        app.get("/allOrders", async(req, res) => {
            const result = await ordersCollection.find({}).toArray()
            res.send(result)
        })
        app.put("/orders/:orderId", async(req, res) => {
            const orderId = req.params.orderId
            const update = req.body
            const filter = { _id: ObjectId(orderId) }
            const options = { upsert: true };
            const updateDoc = { $set: { status: update } }
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        app.get("/orders", async(req, res) => {
            const find = req.query.email
            const filter = { email: find }
            const result = await ordersCollection.find(filter).toArray()
            res.send(result)
        })
        app.post("/orders/", async(req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })

        // Post a Review
        app.post("/reviews", async(req, res) => {
                const review = req.body
                const result = await reviewsCollection.insertOne(review)
                res.json(result)
            })
            // Get All Reviews
        app.get("/reviews", async(req, res) => {
            const result = await reviewsCollection.find({}).toArray()
            res.send(result)
        })
    } finally {
        // await client.close()
    }
}
run().catch(console.dir)
app.get("/", (req, res) => {
    res.send("Hello, This is from node js. this is first page.")
})

app.listen(port)