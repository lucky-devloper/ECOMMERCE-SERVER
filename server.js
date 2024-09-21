const express = require('express')
const app = express()
const userRoute= require('./routes/userRoute')
const productRoute = require('./routes/productRoute')
const cartRoute = require('./routes/cartRoute')
const orderRoute= require('./routes/orderRoute')
const cors = require('cors')
const dotenv= require('dotenv')
const mongoose= require('mongoose')
const cookieParser= require('cookie-parser')

dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin :['https://hostedui.com','http://localhost:5173'],
    methods:['GET','POST','PATCH','DELETE'],
    credentials:true
}))

// Trust proxy
app.set('trust proxy', 1); // Trust first proxy

mongoose.connect(process.env.CONNECTION_URI).then(()=>{
    console.log("mongodb connected")
})

app.get('/',(req,res)=>{
    // res.cookie("name","vikash")
    const manual='products- /api/products  ||   singleproduct- /api/product/:id || deleteproduct- method-delete| /api/product/delete/:prodid || toadd a review:- method-patch api/product/review/:prodid body-{rating,description,images,userInfo}  || getcart- /api/cart/:userId'
    res.send(manual)
})



app.use('/api',userRoute)
app.use('/api',productRoute)
app.use('/api',cartRoute)
app.use('/api',orderRoute)
const port=process.env.PORT || 3000
app.listen(port,()=>{
    console.log("server is running on port "+port)
})