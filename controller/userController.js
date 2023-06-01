import asyncHandler from "express-async-handler";
import User from "../models/userModels.js";
import { server } from "@passwordless-id/webauthn";

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
    const { username } = req.query;
    console.log(username);

    try {
        const user = await User.findOne({ username });
        res.json({ isRegistered: !!user });
    } catch (error) {
        console.error('Failed to check registration status:', error);
        res.sendStatus(500);
    }
};

// Registering user
const register = async (req, res) => {
    const { username, verifyRegistrationData } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { username },
            { $set: { verifyRegistrationData }, $push: { credentialKeys: verifyRegistrationData.credential.id } },
            { upsert: true, new: true }
        );

        if (user) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    } catch (error) {
        console.error('Registration failed:', error);
        res.sendStatus(500);
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
        res.sendStatus(500);
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
            res.sendStatus(200);
        } else {
            // User not found
            res.sendStatus(401);
        }
    } catch (error) {
        console.error('Authentication verification failed:', error);
        res.sendStatus(500);
    }
};


// Logging out user
const logoutUser = async (req, res) => {
    // Clear authentication state or session
    res.sendStatus(200);
};

export { getChallenge, checkIsRegistered, register, verifyRegistrationPayload, verifyUserAuthentication, logoutUser };
