import express from 'express';
import { getChallenge, checkIsRegistered, register, verifyRegistrationPayload, verifyUserAuthentication, logoutUser } from '../controller/userController.js';

const userRoutes = express.Router();

// Requesting challenge
userRoutes.get('/getChallenge', getChallenge);

// Checking if user is registered
userRoutes.get('/checkIsRegistered', checkIsRegistered);

// Registering user
userRoutes.post('/register', register);

// Verifying registration payload
userRoutes.post('/verifyRegistration', verifyRegistrationPayload);

// Authenticating user
userRoutes.post('/verifyAuthentication', verifyUserAuthentication);

// Logging out user
userRoutes.post('/logout', logoutUser);


export { userRoutes };
