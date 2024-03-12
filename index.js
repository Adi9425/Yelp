if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
console.log(process.env.SECRET);

const express = require('express');

const path = require('path');
const mongoose =require('mongoose');
const ejsMate =require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy =require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const catchAsync = require('./utils/catchAsync');
const Joi = require('joi');
const {campgroundSchema,reviewSchema} = require('./schemas');



const Campground = require('./models/campground');
const Review = require('./models/review');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { log } = require('console');
// const { error } = require('console');
// const catchAsync = require('./utils/catchAsync');
const DBUrl = process.env.DB_URL;
// 
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    // useNewUrlParser : true,
    // useCreateIndex : true,
    // useUnifiedTopology : true
    

});






const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
}); 

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
// app.get('/makecampground',async(req,res)=>{
//     const camp = new campground({title : 'My backyard',description: 'cheap champing'});
//     await camp.save();
//     res.send(camp);
// })
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());

const sessionConfig = {
    secret:'thisshouldbebettersecret!!',resave: false,
    saveUninitialized: true,
    cookie:{
        httponly: true,
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7 
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    console.log(req.query);
    res.locals.currentUser = req.user;//passport use kar rahe hai isame locals passpoert ki property hai 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes)



app.get('/',async(req,res)=>{
    res.render('home');
    // const campgrounds =await Campground.find({});
    // res.render('campgrounds/index',{campgrounds})

});


app.all('*',(req,res,next)=>{
    // res.send("404!!!!!!!!!")
    next(new ExpressError('page not found',404))
})
app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'oh no something went wrong!'
    res.status(statusCode).render('error',{err})
    // res.send('oh boy')
})
app.listen(process.env.PORT || 3000,()=>{
    console.log('server on port 3000');
})