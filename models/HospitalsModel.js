import {mongoose, model} from 'mongoose';
import { HospitalsSchema } from '../schemas/HospitalsSchema';

export const HospitalsModel = mongoose.model("hospital", HospitalsSchema);