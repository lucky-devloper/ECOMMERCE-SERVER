const express = require("express");
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password, avatar, city, nearby, state } = req.body;

  try {
    const finduser = await userModel.findOne({ email });
    if (finduser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new userModel({
      username,
      email,
      password: hash,
      avatar,
      address: { city, nearby, state },
    });

    await user.save();

    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: '24h' });

    return res.status(201).json({ message: "User signup successful", user,token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while signing up", error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "24h" });


    return res.status(200).json({ message: "User logged in successfully", user,token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error while logging in", error });
  }
});

// route to update profile
router.patch('/profile/:id',async(req,res)=>{
  const id= req.params.id
  try {
     const user=await userModel.findById(id)
     if(!user){
       return res.status(404).json({message:'user not found'})
     }
     user.avatar=req.body.avatar
     await user.save()
     return res.status(200).json({message:'profile updated',user})
  } catch (error) {
    return res.status(500).json({message:'server error while updating profile',error})
  }
})

// route to update address
router.patch('/address/:id',async(req,res)=>{
 const id= req.params.id
 const {state,city,nearby} = req.body
 try {
    const user=await userModel.findById(id)
    if(!user){
      return res.status(404).json({message:'user not found'})
    }
    user.address={state,city,nearby}
    await user.save()
    return res.status(200).json({message:'address updated',user})
 } catch (error) {
   return res.status(500).json({message:'server error while updating address',error})
 }
})

module.exports = router;
