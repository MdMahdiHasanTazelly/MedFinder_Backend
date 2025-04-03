import express from 'express';
import { addDoctor, addDoctorChamber, deleteDoctor, deleteDoctorChamber, 
    getAllDoctors, getDoctorById, getDoctorChamber, getSearchBasedDoctor, 
    updateDoctor } from '../controller/doctorController.js';

const router = express.Router();

router.get("/", getAllDoctors);

router.get("/search", getSearchBasedDoctor);

router.get("/:id", getDoctorById);

router.post('/', addDoctor);

router.get("/:id/hospital-detail", getDoctorChamber);

router.delete("/:id/hospital-detail/:hRegNo", deleteDoctorChamber);

router.put("/addHReg/:id", addDoctorChamber);

router.put("/:id/update", updateDoctor);

router.delete("/:id", deleteDoctor);

export {router as doctorRouter};