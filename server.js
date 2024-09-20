const express = require('express')
const app = express()
const uploadRoute= require('./routes/uploadRoute')
const userRoute= require('./routes/userRoute')
const productRoute = require('./routes/productRoute')
const cartRoute = require('./routes/cartRoute')
const paymentRoute= require('./routes/paymentRoute')
const orderRoute= require('./routes/orderRoute')
const cors = require('cors')
const dotenv= require('dotenv')
const mongoose= require('mongoose')
const cookieParser= require('cookie-parser')

dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin :['https://techstufff.vercel.app','http://localhost:5173'],
    methods:['GET','POST','PATCH','DELETE'],
    credentials:true
}))

mongoose.connect(process.env.CONNECTION_URI).then(()=>{
    console.log("mongodb connected")
})

app.get('/',(req,res)=>{
    // res.cookie("name","vikash")
    res.send('server is working')
})



app.use('/api',uploadRoute)
app.use('/api',userRoute)
app.use('/api',productRoute)
app.use('/api',cartRoute)
app.use('/api',paymentRoute)
app.use('/api',orderRoute)
const port=process.env.PORT || 3000
app.listen(port,()=>{
    console.log("server is running on port "+port)
})