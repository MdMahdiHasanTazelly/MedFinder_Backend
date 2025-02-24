import { Schema } from "mongoose";

export const HospitalsSchema = new Schema({
    name: String,
    contactNo: String,
    location:{
        district: String,
        subDistrict: String,
        road: String,
        holdingNo: String
    }
});