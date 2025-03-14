import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';

import {DoctorsModel} from './models/DoctorsModel.js';
import { HospitalsModel } from './models/HospitalsModel.js';
import {AdminModel} from './models/AdminModel.js';

import { authenticate, generateToken } from './utils/middleware.js';
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

//helps to parse json data
app.use(express.json());
//helps to parse url-encoded form data
app.use( express.urlencoded({extended: true}) );

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
                return res.json({error: "Invalid credentials!"});
            }
        }catch(error){
            console.log(error);
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
            return res.json({error: "No hospital found!"})
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
            return res.json({error: "Fill all the informaitions."});
        }
        const newHospital = await HospitalsModel(hospital);
        newHospital.save()
        .then( ()=>{
            return res.json("Hospital is added.");
        });
        //res.json(hospital);
    }catch(err){
        console.log(err);
    }
})

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
            return res.json({ error: "Invalid doctor ID format." });
        }

        let doctor = await DoctorsModel.findById(id);
    
        if( !doctor ){
            return res.json({error: "Doctor not found!"});
        }

        res.json(doctor);
    }catch(err){
        console.log(err);
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
        return res.json({error: "Fill all informations."})
    }
    const newDoctor = await DoctorsModel(doctor);
    newDoctor.save()
    .then( ()=>{
        console.log("Doctors information is added.")
    });
    //res.json(doctor);
    }catch(error){
        console.log(error);
    }
})