import { Schema } from "mongoose";

export const AdminSchema = new Schema({
    username: String,
    email: String,
    password: String,
});