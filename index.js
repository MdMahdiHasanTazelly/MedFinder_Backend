import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import {DoctorsModel} from './models/DoctorsModel.js';
import { HospitalsModel } from './models/HospitalsModel.js';
import {AdminModel} from './models/AdminModel.js';

import { authenticate, generateToken } from './utils/middleware.js';


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

//helps to parse json data
app.use(express.json());
//helps to parse url-encoded form data
app.use( express.urlencoded({extended: true}) );
app.use(cookieParser());

// for testing purpose
app.get("/test", (req, res)=>{
    res.json({"message": "This is for testing!"});
});

app.get("/admin/login", 
    async(req, res)=>{
        try{
            const {email, password} = req.body;
            const admin = await AdminModel.findOne({email, password});

            if( admin ){
                const loginToken = await generateToken();
                admin.sessiontoken = loginToken;
                admin.save();
                return res.cookie('sessiontoken',loginToken).json({message: "Login Successfull!"});
            }else{
                return res.status(400).json({error: "Invalid credentials!"});
            }
        }catch(error){
            console.log(error);
        }
});


app.get("/admin/logout", async(req, res)=>{
    try{
        const sessiontoken = req.cookies.sessiontoken;
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
})

app.get("/hospitals", async(req, res)=>{
    const hospitals = await HospitalsModel.find();
    res.json(hospitals);
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
        console.log(error);
        if(error.code === 11000){
            return res.json({message: "Registration number should be unique."}).status(400);
        }
        res.status(500).json({message: "Internal server error."});
    }
})

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
        res.status(400).json({message: "Internal Server error."});
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
            return res.status(400).json({error: "Fill all informations."});
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

app.put("/doctors/:id", async(req, res)=>{
    try{
        let {id} = req.params;
        let update = req.body;
        const doctor = await DoctorsModel.findById(id);
        if(!doctor){
            return res.status(400).json({message: "No such doctor Found."});
        }
        
        const updatedDoc = await DoctorsModel.findByIdAndUpdate(id, {...update});
        console.log(updatedDoc);
        res.json({message: "Information is updated."});
    }catch(error){
        res.status(500).json({message: "Internal server error."});
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
        console.log(error)
        res.status(500).json({message: "Internal server error."})
    }
});