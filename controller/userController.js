import asyncHandler from "express-async-handler";
import User from "../models/userModels.js";
import { server } from "@passwordless-id/webauthn";
import nodemailer from "nodemailer";

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
const checkIsRegistered = async (req, res) => {
    const { username } = req.body;
    // console.log(userna);

    try {
        const user = await User.findOne({ username });
        res.json({ isRegistered: !!user });
    } catch (error) {
        console.error('Failed to check registration status:', error);
        res.sendStatus(500).json({ message: error.message });
    }
};

//send otp mail
const sendOTPEmail = async (email, otp) => {
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

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    } catch (error) {
        console.error('Failed to send OTP email:', error);
    }
}

// OTP verification function
function verifyOTP(otp) {
    // Perform OTP verification logic here
    // ...

    // Return true if OTP is valid, false otherwise
    return otp === '123456'; // Replace with your actual OTP verification logic
}

// Registering user
const register = async (req, res) => {
    const { username, verifyRegistrationData, otp } = req.body;

    if (verifyOTP(otp)) {
        try {
            const user = await User.findOneAndUpdate(
                { username },
                { $set: { verifyRegistrationData }, $push: { credentialKeys: verifyRegistrationData.credential.id } },
                { upsert: true, new: true }
            );

            if (user) {
                res.sendStatus(200);
            } else {
                res.sendStatus(500).json({ message: "User not found" });
            }
        } catch (error) {
            console.error('Registration failed:', error);
            res.sendStatus(500).json({ message: error.message });
        }
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
};

// Verifying registration payload
const verifyRegistrationPayload = async (req, res) => {
    const { registration } = req.body;

    try {
        const registrationData = await server.verifyRegistration(registration, {
            challenge,
            origin: "http://localhost:5000"
        });
        res.json(registrationData);
    } catch (error) {
        console.error('Registration verification failed:', error);
        res.sendStatus(500).json({ message: error.message });
    }
};


const verifyUserAuthentication = async (req, res) => {
    const { authentication } = req.body;
    // console.log(authentication.credentialId);
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
            res.sendStatus(200).json({ message: "Authentication successful" });
        } else {
            // User not found
            res.sendStatus(401).json({ message: "User not found" });
        }
    } catch (error) {
        console.error('Authentication verification failed:', error);
        res.sendStatus(500).json({ message: error.message });
    }
};


// Logging out user
const logoutUser = async (req, res) => {
    // Clear authentication state or session
    res.sendStatus(200);
};

export { getChallenge, checkIsRegistered, register, verifyRegistrationPayload, verifyUserAuthentication, logoutUser };
