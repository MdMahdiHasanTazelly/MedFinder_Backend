
import { Schema, mongoose } from "mongoose";
import {DoctorsModel} from "../models/DoctorsModel.js";

const HospitalsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    doctors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'DoctorsModel'
        }
    ],
    location:{
        district: {
            type: String,
            required: true
        },
        subDistrict: {
            type: String,
            required: true
        },
        holdingNo: {
            type: String,
            required: true
        },
        road: String,
    }
});

export const HospitalsModel = mongoose.model("hospital", HospitalsSchema);