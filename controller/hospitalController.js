import { HospitalsModel } from "../models/HospitalsModel.js";
import { isWhiteSpace } from "../utils/middleware.js";

export const getAllHospitals = async(req, res)=>{
    const hospitals = await HospitalsModel.find();
    res.json(hospitals);
};


export const getSearchBasedHospital = async(req, res)=>{
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
};


export const getHospitalById = async(req, res)=>{
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
};



export const addHospital = async(req, res)=>{
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
};



export const deleteHospital = async(req, res)=>{
    try{
        let {id} = req.params;
        const deletedHospital = await HospitalsModel.findOneAndDelete({_id: id});
        if( deletedHospital ){
            return res.json({message: "Hospital is deleted."});
        }
        res.json({error: "Cannot be deleted!"}).status(400);
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Internal server Error."});
    }
};


export const updateHospital = async(req, res)=>{
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
            return res.json({message: "Information is updated."});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Internal server error."});
    }

};