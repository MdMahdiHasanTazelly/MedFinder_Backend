import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import {DoctorsModel} from './models/DoctorsModel.js';
import { HospitalsModel } from './models/HospitalsModel.js';
import {AdminModel} from './models/AdminModel.js';

import { generateToken , isWhiteSpace} from './utils/middleware.js';
import { copyFileSync } from 'fs';
import { error } from 'console';

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, 
    ()=> {
        console.log(`Listening on port ${PORT}`);
        mongoose.connect(process.env.DB_URL)
        .then( ()=> console.log("Database is conneccted.") )
        .catch( (err)=> console.log(err) );
    }
);

//allows only frontend to fetch data
app.use(cors({origin: process.env.FRONTEND_URL}));

//helps to parse json data
app.use(express.json());
//helps to parse url-encoded form data
app.use( express.urlencoded({extended: true}) );
app.use(cookieParser());

// for testing purpose
app.get("/test", (req, res)=>{
    res.json({message: "This is for testing!"});
});

app.post("/admin/login", 
    async(req, res)=>{
        try{
            const {email, password} = req.body;
            const admin = await AdminModel.findOne({email, password});

            if( admin ){
                const loginToken = await generateToken();
                admin.sessiontoken = loginToken;
                admin.save();
                return res.json({message: "Login Successfull!", sessiontoken: loginToken});
            }else{
                return res.status(400).json({error: "Invalid credentials!"});
            }
        }catch(error){
            console.log(error);
        }
});


app.post("/admin/logout", async(req, res)=>{
    try{
        const {sessiontoken} = req.body;
        const admin = await AdminModel.findOne({sessiontoken: `${sessiontoken}`});
        
        const newAdmin = await AdminModel({
            username: admin.username,
            email: admin.email,
            password: admin.password
        });

        await AdminModel.deleteOne({email: `${admin.email}`});

        newAdmin.save()
        .then( ()=>{
            res.json({message: "Logged out successfully!"});
        })
        
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error!"});
    }
});

// ----------------------------HOSPITALS ROUTE--------------------------------


app.get("/hospitals", async(req, res)=>{
    const hospitals = await HospitalsModel.find();
    res.json(hospitals);
});


app.get("/hospitals/search", async(req, res)=>{
    try{
        let {query} = req.query;
        if( !query ){
            return res.status(400).json({message: "Query is required."});
        }
        const hospitals = await HospitalsModel.find({
            name: { $regex: query, $options: "i"}    //case-insensitive search based on given query for hopital name
        });
        if( hospitals.length ===0 ){
            return res.status(400).json({message: "No hospital is found!"});
        }
        res.json(hospitals);
    }catch(error){
        return res.status(500).json({message: "Internal server error."});
    }
});


app.get("/hospitals/:id", async(req, res)=>{
    try{
        let {id} = req.params;

          // if dosen't math the mongodb id format
          if (!id.match(/^[0-9a-fA-F]{24}$/)) {
               return res.json({ error: "Invalid hospital ID format." });
          }

        let hospital = await HospitalsModel.findById(id);
        if( !hospital){
            return res.status(400).json({error: "No hospital found!"});
        }
        res.json(hospital);
    }catch(err){
        console.log(err);
    }
});


app.post("/hospitals", async(req, res)=>{
    try{
        let hospital = req.body;

        if( !hospital.hRegNo ||
            !hospital.name ||
            !hospital.contactNo ||
            !hospital.location.district ||
            !hospital.location.subDistrict ||
            !hospital.location.holdingNo 
        ){
            return res.status(400).json({error: "Fill all the informaitions."});
        }

        // checking whether only whitespace or not
        if(
            isWhiteSpace(hospital.hRegNo) ||
            isWhiteSpace(hospital.name) ||
            isWhiteSpace(hospital.contactNo) ||
            isWhiteSpace(hospital.location.district) ||
            isWhiteSpace(hospital.location.subDistrict) ||
            isWhiteSpace(hospital.location.holdingNo)
        ){
            return res.status(400).json({error: "Fill all the informaitions correctly"});
        }
        const newHospital = await HospitalsModel(hospital);
        await newHospital.save()
        
        res.json({message: "Hospital is added."});
        
    }catch(error){
        if(error.code === 11000){
            return res.status(400).json({error: "Registration number should be unique."});
        }
        res.status(500).json({error: "Internal server error."});
    }
});


app.delete("/hospitals/:id", async(req, res)=>{
    try{
        let {id} = req.params;
        const deletedHospital = await HospitalsModel.findByIdAndDelete(id);
        if( deletedHospital ){
            return res.json({message: "Hospital is deleted."});
        }
        res.json({message: "Cannot be deleted!"}).status(400);
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server Error."});
    }
});

app.put("/hospitals/:id", async(req, res)=>{
    try{
        let {id} = req.params;
        let updated = req.body;
        if( !updated.hRegNo ||
            !updated.name ||
            !updated.contactNo ||
            !updated.location.district ||
            !updated.location.subDistrict ||
            !updated.location.holdingNo 
        ){
            return res.status(400).json({error: "Fill all the informaitions."});
        }

        // checking whether only whitespace or not
        if(
            isWhiteSpace(updated.hRegNo) ||
            isWhiteSpace(updated.name) ||
            isWhiteSpace(updated.contactNo) ||
            isWhiteSpace(updated.location.district) ||
            isWhiteSpace(updated.location.subDistrict) ||
            isWhiteSpace(updated.location.holdingNo)
        ){
            return res.status(400).json({error: "Fill all the informaitions correctly"});
        }

        const hospital = await HospitalsModel.findByIdAndUpdate(id, {...updated});
        if (hospital){
            console.log(updated);
            return res.json({message: "Information is updated."});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }

});

// ---------------------DOCTORS ROUTES---------------------

app.get("/doctors", async(req, res)=>{
    const doctors = await DoctorsModel.find();
    res.json(doctors);
})

app.get("/doctors/search", async(req, res)=>{
    try{
        let {query} = req.query;
        if( !query ){
            return res.status(400).json({message: "Query is required."});
        }
        const doctors = await DoctorsModel.find({
            name: {$regex: query, $options: "i"}  //applyying case-insensitive search for doctors name based query
        });
        if( doctors.length === 0){
            return res.status(400).json({message: "No such doctors."});
        }
        res.json(doctors);
    }catch(error){
        return res.status(500).json({message: "Internal server error."});
    }
})

app.get("/doctors/:id", async(req, res)=>{
    try{
        let {id} = req.params;
        // if dosen't math the mongodb id format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.json({ error: "Invalid doctor ID format." }).status(400);
        }

        let doctor = await DoctorsModel.findById(id);

        if( !doctor ){
            return res.json({error: "Doctor not found!"});
        }

        res.json(doctor);
    }catch(err){
        console.log(err);
        res.status(400).json({error: "Internal Server error."});
    }
});

app.post("/doctors", async(req, res)=>{
    try{
        let doctor = req.body;
        if(
            !doctor.name ||
            !doctor.dRegNo ||
            !doctor.degree ||
            !doctor.specialization ||
            !doctor.contactNo
        ){
            return res.status(400).json({message: "Fill all informations."});
        }

        // checking whether only whitespace or not
        if(
            isWhiteSpace(doctor.dRegNo) ||
            isWhiteSpace(doctor.name) ||
            isWhiteSpace(doctor.contactNo) ||
            isWhiteSpace(doctor.degree) ||
            isWhiteSpace(doctor.specialization) 
        ){
            return res.status(400).json({error: "Fill all the informaitions correctly"});
        }

        const newDoctor = await DoctorsModel(doctor);
        await newDoctor.save()
        res.json({message: "Doctors information is saved."});
    }catch(error){
        if(error.code === 11000 ){
            return res.status(400).json({message: "Registration number should be unique."});
        }
        res.status(500).json({message: "Internal Server Error."});
    }
});

// to get a doctor's chambers information
app.get("/doctors/:id/hospital-detail", async(req, res)=>{
    try{
        let {id} = req.params;
        const doctor = await DoctorsModel.findById(id);
        if( !doctor ){
            return res.status(400).json({error: "No doctor found"});
        }
        const regNo = doctor.dRegNo;
        //returns those hospitals details, are stored in doctor's hospital array
        const hospitals = await HospitalsModel.find({
            hRegNo: { $in: doctor.hospitals.map(h => h.hRegNo) }
        });
    
        const hospitalDetails = hospitals.map( (hospital)=>{
            //return doctors information if hospital's hRegNo is in doctor's hospital array
            const doctorInfo = doctor.hospitals.find( (d)=> d.hRegNo===hospital.hRegNo );
            return {
                hRegNo: hospital.hRegNo,
                name: hospital.name,
                contact: hospital.contactNo,
                days: doctorInfo.days,
                time: doctorInfo.time,
            }
        });
        res.json(hospitalDetails);

    }catch(error){
        console.log(error);
        res.status(500).json({message: "Internal Server Error."});
    }
});

//to delete a doctors chamber
app.delete("/doctors/:id/hospital-detail/:hRegNo", async(req, res)=>{
    try{
        let{id, hRegNo} = req.params;
        const doctor = await DoctorsModel.findById(id);
        const updatedHospitals = doctor.hospitals.filter(
             doctor=> hRegNo!=doctor.hRegNo
        );
        
        const updatedDoctor = await DoctorsModel.findOneAndUpdate(
            { _id: id }, // Find doctor by ID
            { $set: { hospitals: updatedHospitals } }, // Update only hospitals array
            { new: true }
        );
        
        console.log(updatedDoctor);

        res.json({message: "Chamber information is deleted."});
    }catch(error){
        res.status(500).json({error: "Internal server error!"});
    }
});

//adds hospitals registration number to doctors profile
app.put("/doctors/addHReg/:id", async(req, res)=>{
    let{id} = req.params;
    let{regNo, days, time} = req.body;
    const doctor = await DoctorsModel.findById(id);
    // if the hospital is already added
    if (doctor.hospitals.includes(regNo)) {
        return res.status(400).json({ error: "Hospital is already added!" });
    }

    if(!regNo || !days || !time){
        return res.status(400).json({error: "Enter all the informations."});
    }

    if(
        isWhiteSpace(regNo) ||
        isWhiteSpace(days) ||
        isWhiteSpace(time)
    ){
        return res.status(400).json({error: "Enter all the informations correctly."});
    }

    const allHospital = await HospitalsModel.find({hRegNo: regNo});
    if(allHospital.length === 0){
        return res.status(400).json({error: "Hospital is not affiliated with this application!"});
    }

    //adding hospitals registration number
    doctor.hospitals.push({
        hRegNo: regNo, days, time
    });
    await doctor.save();

    return res.json({message: "Hospital's registration number is added!"});
});


app.put("/doctors/:id/update", async(req, res)=>{
    try{
        let {id} = req.params;
        let update = req.body;
        console.log(update);
        if(
            !update.name ||
            !update.dRegNo ||
            !update.degree ||
            !update.specialization ||
            !update.contactNo
        ){
            return res.status(400).json({error: "Fill all informations."});
        }

        if(
            isWhiteSpace(update.name) ||
            isWhiteSpace(update.dRegNo) ||
            isWhiteSpace(update.degree) ||
            isWhiteSpace(update.specialization) ||
            isWhiteSpace(update.contactNo)
        ){
            return res.status(400).json({error: "Enter all the informations correctly."});
        }
        const doctor = await DoctorsModel.findById(id);
        if(!doctor){
            return res.status(400).json({error: "No such doctor Found."});
        }
        
        const updatedDoc = await DoctorsModel.findByIdAndUpdate(id, {...update});
        console.log(updatedDoc);
        res.json({message: "Information is updated."});
    }catch(error){
        res.status(500).json({error: "Internal server error."});
    }

});

app.delete("/doctors/:id", async(req, res)=>{
    try{
        let {id} = req.params;
        const doctor = await DoctorsModel.findById(id);
        if( !doctor ){
            return res.status(400).json({message: "No doctor found."});
        }
        await DoctorsModel.findByIdAndDelete(id);
        console.log(doctor);
        res.json({message: "Doctor is deleted."});
    }catch(error){
        res.status(500).json({error: "Internal server error."})
    }
});