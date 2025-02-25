require("dotenv").config() // gets the key value pair from the env file into process.env

const express=require("express")
const axios=require("axios") // used for making api requests on the backend. Remember fetch is a web api and cannot be used here
const cors=require("cors")
const cookieParser=require("cookie-parser") // To parse cookies to token

const app=express()
const PORT=5000

app.use(cookieParser())

app.set("trust proxy", 1)

app.use(cors({
    origin: [
        "https://trim-doc-frontend.vercel.app", "https://trim-doc-frontend-pratyushkumarvs-projects.vercel.app", "http://127.0.0.1:5500","chrome-extension://jgglhcjgfbejdgpdacioocpjfplmkgbc"
    ],    
    credentials: true // allows cookies to be sent in the request
})) // Allows frontend requests. the frontend is hosted on a different server
app.use(express.json()) // parses incoming json from the frontend which is handled using the req parameter

app.post("/api/get-cookie", async (req, res)=>{
    try{
        const response=await axios.post(`https://api.ilovepdf.com/v1/auth`, {
            headers:{
                "Content-Type":"application/json"
            },
            public_key:process.env.PUBLIC_KEY
        })
        const token=response.data.token
        res.cookie('api_token', token, {
            expires: new Date(Date.now()+1*60*60*1000), // expires expects a date object 
            httpOnly:true,
            secure : true, 
            sameSite:"None" 
        })
        res.json({message: "Cookie set successfully", token:token, expiry:Date.now()+1*60*60*1000})
    }catch(err){
        res.status(500).json({error: "Error fetching JWT"})
    }
})

app.listen(PORT, ()=>{
    console.log("server listening on Port 5000")
})