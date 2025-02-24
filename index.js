import express from 'express';
import 'dotenv/config';

// import {DoctorsSchema} from './schemas/DoctorsSchema.js';
// import { HospitalsSchema } from './schemas/HospitalsSchema.js';
// import { AdminSchema } from './schemas/AdminSchema.js';

import {DoctorsModel} from './models/DoctorsModel.js';
import { HospitalsModel } from './models/HospitalsModel.js';
import {AdminModel} from './models/AdminModel.js';


const app = express();
const PORT = process.env.PORT;

app.listen(PORT, 
    ()=> console.log(`Listening on port ${PORT}`)
);

// for testing purpose
app.get("/test", (req, res)=>{
    res.json({"message": "This is for testing!"});
});