import mongoose from "mongoose";
import { hospitals } from "./hospital.js";
import { doctors } from "./doctors.js";
import { adminData } from "./admin.js";

import { DoctorsModel } from "../models/DoctorsModel.js";
import { AdminModel } from "../models/AdminModel.js";
import { HospitalsModel } from "../models/HospitalsModel.js";

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// loading .env file from the root folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connecting Mongo atlas 
async function main() {
    await mongoose.connect(process.env.DB_URL);
    doctorsInit();
    // hospitalsInit();
    // adminInit();
}
main()
.then( ()=> console.log(`DB is connected`))
.catch( (err)=> console.log(err));

async function doctorsInit() {
    // cleaning the doctors collection
    await DoctorsModel.deleteMany({});
    // Doctors info inilialization
    DoctorsModel.insertMany(doctors)
    .then( ()=> console.log("Doctors data is initialised") );
}

async function hospitalsInit() {
    // cleaning the hospitals collection
    await HospitalsModel.deleteMany({});
    // Hospitals info inilialization
    HospitalsModel.insertMany(hospitals)
    .then( ()=> console.log("Hospitals data is initialised") );
}


async function adminInit() {
    // cleaning the hospitals collection
    await AdminModel.deleteMany({});
    // Doctors info inilialization
    AdminModel.insertMany(adminData)
    .then( ()=> console.log("Admin data is initialised") );
}
