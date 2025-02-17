import express from 'express';
import 'dotenv/config'

const app = express();
const PORT = process.env.PORT;

app.listen(PORT, 
    ()=> console.log(`Listening on port ${PORT}`)
);

// for testing purpose
app.get("/test", (req, res)=>{
    res.json({"message": "This is for testing!"});
});