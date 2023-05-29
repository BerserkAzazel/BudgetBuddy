const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        username: { type: "String", required: true },
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
        credentialId: {
            type: String,
            required: true,
        },
        signature: {
            type: String,
            required: true,
        }
    },
    { timestaps: true }
);

userSchema.methods.matchCredentials = async function (eneteredCredentials) {
    return await bcrypt.compare(eneteredCredentials, this.credentialId);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.credentialId = await bcrypt.hash(this.credentialId, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
