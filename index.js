import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { adminRouter } from './router/adminRouter.js';
import { doctorRouter } from './router/doctorRouter.js';
import { hospitalRouter } from './router/hospitalRouter.js';

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, 
    ()=> {
        console.log(`Listening on port ${PORT}`);
        mongoose.connect(process.env.DB_URL)
        .then( ()=> console.log("Database is connected.") )
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

app.use("/admin", adminRouter);

app.use("/doctors", doctorRouter);

app.use("/hospitals", hospitalRouter);
