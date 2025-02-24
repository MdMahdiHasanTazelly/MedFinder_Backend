import { model, mongoose } from "mongoose";
import { AdminSchema } from "../schemas/AdminSchema";

export const AdminModel = mongoose.model("admin", AdminSchema);