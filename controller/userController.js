import asyncHandler from "express-async-handler";
import User from "../models/userModels.js";
import { server } from "@passwordless-id/webauthn";
import nodemailer from "nodemailer";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

let challenge = "a7c61ef9-dc23-4806-b486-2428938a547e"
// Custom challenge generation
// const generateChallenge = () => {
//     const challenge = Math.random().toString(36).substr(2, 10);
//     return challenge;
// };

// Requesting challenge
const getChallenge = (req, res) => {
    // Generate and return a challenge
    // const challenge = generateChallenge();
    res.json({ challenge });
};

// Checking if user is registered
const checkIsRegistered = asyncHandler(async (req, res) => {
    const { username } = req.body;
    //  // console.log(userna);

    try {
        const user = await User.findOne({ username });
        res.json({ isRegistered: !!user });
    } catch (error) {
        // console.error('Failed to check registration status:', error);
        res.status(500).send({ message: error.message });
    }
});

//Get User info
const getUserInfo = asyncHandler(async (req, res) => {
    const { credentialId } = req.body;
    try {
        const user = await User.findOne({ credentialKeys: credentialId });
        if (user) {
            return res.status(200).json({ user })
            console.log(user);
        }
    } catch (err) {
        return res.status(500).send(err)
    }
})

//send otp mail
const sendOTPEmail = asyncHandler(async (email, otp) => {
    try {
        // Create a transporter using your email service provider credentials
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: `Hello world?${ otp }`, // plain text body
            html: "<b>Hello world?</b>", // html body
        });

        // console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (error) {
        // console.error('Failed to send OTP email:', error);
    }
});

// OTP verification function
function verifyOTP(otp) {
    // Perform OTP verification logic here
    // ...

    // Return true if OTP is valid, false otherwise
    return otp === '123456'; // Replace with your actual OTP verification logic
}

// Registering new device for existing user
const register = asyncHandler(async (req, res) => {
    const { username, verifyRegistrationData, otp } = req.body;

    if (verifyOTP(otp)) {
        try {
            const user = await User.findOneAndUpdate(
                { username },
                { $set: { verifyRegistrationData }, $push: { credentialKeys: verifyRegistrationData.credential.id } },
                //{ upsert: true, new: false }
            );

            if (user) {
                res.status(200);
            } else {
                res.status(500).send({ message: "User not found" });
            }
        } catch (error) {
            // console.error('Registration failed:', error);
            res.status(500).send({ message: error.message });
        }
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});

// Verifying registration payload
const verifyRegistrationPayload = asyncHandler(async (req, res) => {
    const { registration } = req.body;

    try {
        const registrationData = await server.verifyRegistration(registration, {
            challenge,
            origin: "http://localhost:5000"
        });
        res.json(registrationData);
    } catch (error) {
        // console.error('Registration verification failed:', error);
        res.status(500).send({ message: error.message });
    }
});


const verifyUserAuthentication = asyncHandler(async (req, res) => {
    const { authentication } = req.body;
    //  // console.log(authentication.credentialId);
    try {
        const user = await User.findOne({ credentialKeys: authentication.credentialId });

        if (user) {
            const credential = user.verifyRegistrationData.credential
            const expected = {
                challenge: challenge,
                origin: "http://localhost:5000",
                userVerified: true,
                counter: 0,
            };

            await server.verifyAuthentication(authentication, credential, expected);

            // Authentication successful
            res.status(200).send({ message: "Authentication successful" });
        } else {
            // User not found
            res.status(401).send({ message: "User not found" });
        }
    } catch (error) {
        // console.error('Authentication verification failed:', error);
        res.status(500).send({ message: error.message });
    }
});

// Register new users
const registerNewUsers = asyncHandler(async (req, res) => {
    const { username, email, verifyRegistrationData, name } = req.body;

    try {
        const userExist = await User.findOne({ email });
        const usernameExist = await User.findOne({ username });

        if (userExist) {
            return res.status(500).send({ message: "Email already exists" });
        }
        if (usernameExist) {
            return res.status(500).send({ message: "Username already exists" });
        }

        const user = new User({
            username,
            email,
            verifyRegistrationData,
            name,
            credentialKeys: [verifyRegistrationData.credential.id],
        });

        await user.save(); // Save the user to the database

        res.status(200).send({ message: "User registered successfully" });
    } catch (error) {
        // console.error('Registration failed:', error);
        return res.status(500).json({ message: error.message });
    }
});


// Logging out user
const logoutUser = asyncHandler(async (req, res) => {
    // Clear authentication state or session
    res.status(200);
});

const postActionInfo = asyncHandler(async (req, res) => {
    const body = req?.body?.action;// action passed from frontend
    const email = req?.body?.email;//email passed from frontend
    if (body) {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `The following is an action and the category its falls into among categories of [Investments, Savings, Income, Expenses] and the money mentioned in the action:\n\n${body}\n\ ${body}\nCategory:\nMoney:`,
        temperature: 0,
        max_tokens: 64,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      const category = response.data.choices[0].text;
        const money = response.data.choices[1].text;
        
        const user = await User.findOneAndUpdate({email}, {$set:{ [category]: money }},{new:true});
        if(user){
            return res.status(200).json({user})
        }
        return res.status(500).json({message:"User not found"})
    }
    res.send("No action provided");
});

export { getChallenge, checkIsRegistered, register, registerNewUsers, verifyRegistrationPayload, getUserInfo, verifyUserAuthentication, logoutUser, postActionInfo };