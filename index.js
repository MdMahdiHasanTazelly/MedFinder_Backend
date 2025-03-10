import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';

import {DoctorsModel} from './models/DoctorsModel.js';
import { HospitalsModel } from './models/HospitalsModel.js';
import {AdminModel} from './models/AdminModel.js';

import { authenticate } from './utils/middleware.js';


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
//helps to parse url-encoded from data
app.use( express.urlencoded({extended: true}) );

// for testing purpose
app.get("/test", (req, res)=>{
    res.json({"message": "This is for testing!"});
});

app.get("/admin/login", 
    async(req, res)=>{

    const {email, password} = req.body;
    const admin = await AdminModel.findOne({email, password});

    if( !admin ){
        res.json({"Message": "User dosen't exist!"});
    }
})

app.get("/hospitals", async(req, res)=>{
    const hospitals = await HospitalsModel.find();
    res.json(hospitals);
});

app.get("/doctors", async(req, res)=>{
    const doctors = await DoctorsModel.find();
    res.json(doctors);
})