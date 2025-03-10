import { Schema, mongoose } from "mongoose";

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
});

export const AdminModel = mongoose.model("admin", AdminSchema);