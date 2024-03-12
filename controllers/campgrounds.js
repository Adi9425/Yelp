const Campground = require('../models/campground');
const cloudinary = require('../cloudinary').v2;

module.exports.index = async(req,res)=>{
    // res.render('home');
    const campgrounds =await Campground.find({});
    res.render('campgrounds/index',{campgrounds})

}
module.exports.renderNewForm = (req,res)=>{   
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req,res,next)=>{
    //    if(!req.body.campground) throw new ExpressError('invalid Campground data',404)
      
      const campground =await Campground(req.body.campground);
      campground.images = req.files.map(f =>({url:f.path,filename:f.filename}));
      campground.author = req.user._id;
      await campground.save();
      console.log(campground);
      req.flash('success','successfully made a new campground!!')
      res.redirect(`/campgrounds/${campground._id}`)
    
    }
module.exports.showCampground = async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
        path:'author'
    }
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');

    }
    res.render('campgrounds/show',{campground});
}
module.exports.renderEdit = async(req,res)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id)
    // const campground =  await Campground.findById(id);
   
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');

    } 
   
    res.render('campgrounds/edit',{campground});

}
module.exports.updateCampground =async(req,res)=>{
   
    const { id } = req.params;
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f =>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.distory(filename);
        }
    await campground.updateOne({$pull:{images:{filename:{$in:req.body.daleteImages}}}})}
    console.log(campground);
    req.flash('success','Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)

};
module.exports.deleteCampground = async(req,res)=>{
    const { id }= req.params;
    
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted review')
    res.redirect('/campgrounds');
    
};