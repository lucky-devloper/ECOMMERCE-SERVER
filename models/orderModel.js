const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: { type:mongoose.Schema.Types.ObjectId , ref:'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  status:{type:String, enum: ['pending','shipped','delivered','canceled'],default:'pending'},
  totalprice:{ type: Number, required:true},
});

module.exports = mongoose.model("Order", orderSchema);
