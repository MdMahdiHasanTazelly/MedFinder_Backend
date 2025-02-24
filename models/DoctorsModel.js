import { mongoose, model } from "mongoose";
import { DoctrosSchema } from "../schemas/DoctorsSchema";

export const DoctorsModel = mongoose.model("doctor", DoctrosSchema);