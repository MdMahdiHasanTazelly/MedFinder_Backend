import { AdminModel } from "../models/AdminModel.js";
import {randomBytes} from 'crypto';


export const generateToken = async()=>{
    return randomBytes(32).toString('hex');
}