import { DoctorsModel } from "../models/DoctorsModel.js";
import { HospitalsModel } from "../models/HospitalsModel.js";
import { isWhiteSpace } from "../utils/middleware.js";


export const getAllDoctors = async(req, res)=>{
    const doctors = await DoctorsModel.find();
    res.json(doctors);
};


export const getSearchBasedDoctor = async(req, res)=>{
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
};


export const getDoctorById = async(req, res)=>{
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
};


export const addDoctor = async(req, res)=>{
    try{
        let doctor = req.body;
        if(
            !doctor.name ||
            !doctor.dRegNo ||
            !doctor.degree ||
            !doctor.specialization ||
            !doctor.currentRole ||
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
            isWhiteSpace(doctor.specialization) ||
            isWhiteSpace(doctor.currentRole)
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
};



export const getDoctorChamber = async(req, res)=>{
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
};



export const deleteDoctorChamber  = async(req, res)=>{
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
};



export const addDoctorChamber = async(req, res)=>{
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
};



export const updateDoctor = async(req, res)=>{
    try{
        let {id} = req.params;
        let update = req.body;
        console.log(update);
        if(
            !update.name ||
            !update.dRegNo ||
            !update.degree ||
            !update.specialization ||
            !update.currentRole ||
            !update.contactNo
        ){
            return res.status(400).json({error: "Fill all informations."});
        }

        if(
            isWhiteSpace(update.name) ||
            isWhiteSpace(update.dRegNo) ||
            isWhiteSpace(update.degree) ||
            isWhiteSpace(update.specialization) ||
            isWhiteSpace(update.currentRole) ||
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

};



export const deleteDoctor = async(req, res)=>{
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
};