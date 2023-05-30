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
    const { username, registrationData } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { username },
            { $set: { registrationData }, $push: { credentialKeys: registrationData.credential.id } },
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


const verifyUserAuthentication = async (authentication) => {
    try {
        const verificationOptions = {
            challenge: challenge,
            origin: "http://localhost:5000",
            previousCounter: 0,
        };

        const userCredentialKey = await findCredentialKeyById(authentication.credentialId); // Retrieve credential key from the database

        const result = await server.verifyAssertion(authentication, userCredentialKey, verificationOptions);

        // Verification successful
        if (result.verified) {
            console.log('Authentication verification successful');
            console.log('Updated counter:', result.newCounter);
            // Do further processing or return success response
        } else {
            console.log('Authentication verification failed');
            // Return failure response
        }
    } catch (error) {
        console.error('Authentication verification error:', error);
        // Return failure response
    }
};

const findCredentialKeyById = async (credentialId) => {
    try {
        const user = await User.find({ credentialKeys: { "$all": [credentialId] } });
        if (user) {
            console.log(user.registrationData.credential)
            return user.registrationData.credential;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error retrieving credential key:', error);
        throw error;
    }
};



// Logging out user
const logoutUser = async (req, res) => {
    // Clear authentication state or session
    res.sendStatus(200);
};

export { getChallenge, checkIsRegistered, register, verifyRegistrationPayload, verifyUserAuthentication, logoutUser };
