const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const router = express.Router();
require('../config/connectDB');
const User = require('../models/userSchema');
const authenticate = require('../middleware/Authenticate');

router.use(cookieParser());


router.get('/', (req, res) =>{
    res.send(`Hello World from router!`)
});

router.post('/register', async(req, res) => {
    const {name, email, phone, password, cpassword, facebook, instagram, twitter, linkedin} = req.body;

    if(!name || !email || !phone || !password ||!cpassword ||!facebook ||!instagram ||!twitter ||!linkedin)
    {
        return res.status(422).json({error: "Please fill all the fields properly"});
    }
    try {
        const userExist = await User.findOne({$or: [{ email: email }, { phone: phone }]});

        if(userExist) 
        {
            let duplicateField = userExist.email === email ? "Email" : "Phone";
            return res.status(422).json({error: `${duplicateField} Already Registered`});
        }
        else if (password != cpassword) {
            return res.status(422).json({ error:"Password and Confirm Password does not match!" });
        }
        else{
            const baseScore = getRandomInt(5, 10); 
            const currentScore = getRandomInt(2, 15);
            const user = new User({name, email, phone, password, cpassword, baseScore, currentScore, facebook, instagram, twitter, linkedin});

            const userRegister = await user.save();

            if (userRegister) {
                if (currentScore < baseScore) {
                    sendScoreAlertEmail(email, currentScore, baseScore);
                }
                res.status(201).json({ message: "User Registered Successfully" });
            }
        }
    } catch (err) {
        console.log(err);
    }
});

// Helper function to get a random integer within a range
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function sendScoreAlertEmail(email, currentScore, baseScore) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sentimentsync@gmail.com',  
            pass: 'dougfbsnjrqjbmel'  
        }
    });

    const mailOptions = {
        from: 'sentimentsync@gmail.com', 
        to: email,
        subject: 'Urgent: Decline in Your User Sentiment Score',
        text: `
            Dear User,
    
            I hope this email finds you well. Our recent analysis indicates a decline in your User Sentiment Score over the past month. This suggests a potential impact on how your audience perceives your brand.

            Your current score (${currentScore}) is lower than your base score (${baseScore}). Please take action.
    
            To address this, we recommend focusing on enhancing your social reach:
    
            - Engagement Metrics: Evaluate social media interaction levels.
            - Content Relevance: Tailor content to audience needs.
            - Response Time: Ensure timely responses to inquiries.
            - Brand Messaging: Align messaging with audience values.
    
            We're here to assist further and offer insights to help improve your online sentiment. Feel free to reach out for a consultation.
    
            Best Regards,
            SentimentSync
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

router.post('/signin', async(req,res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(422).json({error: 'Please Fill All The Fields Properly'})
        }
        const userLogin = await User.findOne({email: email});

        if(userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if (!isMatch){
                res.status(400).json({error: "Invalid Password"});
            }
            else{
                const token = await userLogin.generateAuthToken();
                res.status(200).json({message: "user signin successfully", token});
            }
        }
        else{
            res.status(400).json({error: "Invalid email"});
        }
    } catch (error) {
        console.log(`${error}`)
    }
});

router.get("/analysis", authenticate, (req, res) => {
    try {
      res.send(req.rootUser);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong or invalid token" });
      console.log(`${error}`);
    }
});

router.get('/logout', (req,res) => {
    console.log('Logout');
    res.status(200).send('Logout Successfully');
});

module.exports = router;