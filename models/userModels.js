import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: { type: "String", required: true, unique: true },
        name: { type: "String", required: true },
        email: { type: "String", required: true, unique: true },
        pic: {
            type: "String",
            required: true,
            default:
                "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        verifyRegistrationData: { type: mongoose.Schema.Types.Mixed },
        credentialKeys: [{ type: String }],
    },
    { timestaps: true }
);


const User = mongoose.model("User", userSchema);

export default User;