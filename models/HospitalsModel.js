import { Schema, mongoose } from "mongoose";
import {DoctorsModel} from "../models/DoctorsModel.js";

const HospitalsSchema = new Schema({
    hRegNo: {
        type: String,
        require: true,
        unique: true,
    },
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
            type: String,
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


//deleting hRegNo from doctor whenever a hospital is deleted 
HospitalsSchema.post("findOneAndDelete", async (doctor)=>{
    if(doctor){
        const hRegNo = doctor.hRegNo;
        await DoctorsModel.updateMany(
            {"hospitals.hRegNo": hRegNo},  //finds doctors having the deleted hospital
            {$pull: {hospitals: {hRegNo: hRegNo} } }  //deleting hospitals 
        );
    }
});

export const HospitalsModel = mongoose.model("hospital", HospitalsSchema);


