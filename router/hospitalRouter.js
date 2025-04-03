import express from 'express';
import { addHospital, getAllHospitals, getHospitalById, getSearchBasedHospital,
    deleteHospital,
    updateHospital
 } from '../controller/hospitalController.js';


const router = express.Router();

router.get("/", getAllHospitals)

router.get("/search",getSearchBasedHospital);

router.get("/:id", getHospitalById);

router.post("/", addHospital);

router.delete("/:id", deleteHospital);

router.put("/:id", updateHospital)

export {router as hospitalRouter};