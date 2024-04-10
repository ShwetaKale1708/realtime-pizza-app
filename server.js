const express=require('express')
const ejs=require('ejs')
const expressLayout=require('express-ejs-layouts')
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')
require('dotenv').config()
const flash=require('express-flash')
const MongoDbStore=require('connect-mongo')
const passport=require('passport')
const Emitter=require('events')



const url=process.env.URL
mongoose.connect(url)
const connection=mongoose.connection
connection.once('open',()=>{
    console.log('Database connected')
})

const app= express()

const PORT=process.env.PORT || 3300



let mongoStore=new MongoDbStore({
    mongoUrl:url,
    collection:'sessions'
})

// event emitter

const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

app.use(express.static('public'))
app.use(expressLayout)
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave:false,
    store:mongoStore,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24}
}))

const passportInit=require('./app/config/passport')
passportInit(passport)

app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
    res.locals.session=req.session
    res.locals.user=req.user
    next()
})
app.use(flash())
app.use(express.json())
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))


require('./routes/web')(app)





const server=app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`)
})


// socket

const io=require('socket.io')(server)

io.on('connection',(socket)=>{
    // join
    
    socket.on('join',(orderId)=>{
        
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})