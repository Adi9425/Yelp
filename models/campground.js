const mongoose =require('mongoose');
const Schema = mongoose.Schema ;
const review = require('./review');
const { string } = require('joi');

const ImageSchema = new Schema({
    url:String,
    filename:String
})
ImageSchema.virtual('themnall').get(function(){
   return  this.url.replace('/upload','/upload/w_200');
})
const CampgoundShema = new Schema({
    title : String,
    images:[ImageSchema],
    price : Number,
    description : String,
    location : String,
    author:
        {type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type :Schema.Types.ObjectId,
            ref:'Review'
        }

    ]
});
CampgoundShema.post('findOneAndDelete',async function(doc){
    if(doc){
        await review.deleteMany({
            _id:{
                $in:doc.reviews
                // here we delete reviews from data base
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgoundShema);
