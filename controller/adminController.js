import { AdminModel } from "../models/AdminModel.js";
import { generateToken } from "../utils/middleware.js";

export const login = async(req, res)=>{
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
}


export const logout = async(req, res)=>{
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
}