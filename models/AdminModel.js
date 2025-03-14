import { Schema, mongoose } from "mongoose";
import { type } from "os";

export const AdminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    sessiontoken: {
        type: String,
    }
});

export const AdminModel = mongoose.model("admin", AdminSchema);