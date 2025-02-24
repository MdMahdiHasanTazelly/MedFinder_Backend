import { Schema } from "mongoose";

export const DoctrosSchema = new Schema({
    name: String,
    degree: String,
    specialization: String,
    contactNo: String
});

