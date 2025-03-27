import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import {DoctorsModel} from './models/DoctorsModel.js';
import { HospitalsModel } from './models/HospitalsModel.js';
import {AdminModel} from './models/AdminModel.js';

import { generateToken } from './utils/middleware.js';
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
        res.status(400).json({error: "Internal Server error."});
    }
})

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

//adds hospitals registration number to doctors profile
app.put("/doctors/addHReg/:id", async(req, res)=>{
    let{id} = req.params;
    let{regNo} = req.body;
    const doctor = await DoctorsModel.findById(id);
    // if the hospital is already added
    if (doctor.hospitals.includes(regNo)) {
        return res.status(400).json({ error: "Hospital is already added!" });
    }

    const allHospital = await HospitalsModel.find({hRegNo: regNo});
    if(allHospital.length === 0){
        return res.status(400).json({error: "Hospital is not affiliated with this application!"});
    }

    //adding hospitals registration number
    doctor.hospitals.push(regNo);
    await doctor.save();

    return res.json({message: "Hospital's registration number is added!"});
});


app.put("/doctors/:id", async(req, res)=>{
    try{
        let {id} = req.params;
        let update = req.body;
        if(
            !update.name ||
            !update.dRegNo ||
            !update.degree ||
            !update.specialization ||
            !update.contactNo
        ){
            return res.status(400).json({error: "Fill all informations."});
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