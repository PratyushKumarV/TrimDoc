require("dotenv").config() // gets the key value pair from the env file into process.env

const express=require("express")
const axios=require("axios") // used for making api requests on the backend
const cors=require("cors")

const app=express()
const PORT=5000

app.use(cors()) // Allows frontend requests. the frontend is hosted on a different server
app.use(express.json()) // parses incoming json from the frontend which is handled using the req parameter

app.get("/api/data", async (req, res)=>{
    try{
        const response=await axios.post(`https://api.ilovepdf.com/v1/auth`, {
            headers:{
                "Content-Type":"application/json"
            },
            public_key:process.env.PUBLIC_KEY
        })
        res.json(response.data)
    }catch(err){
        res.status(500).json({error: "Error fetching JWT"})
    }
})

app.listen(PORT, ()=>{
    console.log("server listening on Port 5000")
})