const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  stock: { type: Number, default: 0, required: true },
  category: { type: String, enum:['camera','phone','laptop','keyboard','mouse'], required: true },
  reviews: [
    {
      rating: { type: Number, default: 0 },
      description: { type: String },
      images: [{ type: String }],
      likes: [{ type: String }], // Store user IDs who liked
      dislikes: [{ type: String }],
      reviewDate: { type: Date, default: Date.now },
      userInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
});

module.exports = mongoose.model('Product', productSchema);
