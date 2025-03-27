import {randomBytes} from 'crypto';


export const generateToken = async()=>{
    return randomBytes(32).toString('hex');
}

//to check whether the input is only a white space or not
export const isWhiteSpace = (str)=>{
    return str.trim().length === 0;
}