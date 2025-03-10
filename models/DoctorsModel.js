import { Schema, mongoose } from "mongoose";
import {HospitalsModel} from "../models/HospitalsModel.js"

const DoctorsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dRegNo:{
        type: String,
        require: true,
        unique: true,
    },
    degree: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    hospitals: [
        {
            type: Schema.Types.ObjectId,
            ref: "HospitalsModel"
        }
    ]
});

export const DoctorsModel = mongoose.model("doctor", DoctorsSchema);