const {campgroundSchema,reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        // console.log(req.path,req.orignialUrl);
        req.session.returnTo = req.originalUrl;
        req.flash('error','you must login');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        console.log("nhi chal raha");
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        console.log(" chal raha");
        next();
    }
}
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground =  await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You dont have this permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const review =  await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You dont have this permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
      }
        next();
      
}