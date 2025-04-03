import express from 'express';
import { login, logout } from '../controller/adminController.js';

const router = express.Router();

router.post("/login", login)

router.post("/logout", logout);

export {router as adminRouter};