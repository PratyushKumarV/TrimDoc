require("dotenv").config() // gets the key value pair from the env file into process.env

const express=require("express")
const axios=require("axios") // used for making api requests on the backend. Remember fetch is a web api and cannot be used here
const cors=require("cors")
const cookieParser=require("cookie-parser") // To parse cookies to token

const app=express()
const PORT=5000

app.use(cookieParser())

app.use(cors({
    origin: ["https://trim-doc-frontend.vercel.app", "https://trim-doc-frontend-pratyushkumarvs-projects.vercel.app","https://trim-doc-frontend-git-main-pratyushkumarvs-projects.vercel.app", "https://trim-doc-frontend-git-main-pratyushkumarvs-projects.vercel.app"],
    credentials: true // allows cookies to be sent in the request
})) // Allows frontend requests. the frontend is hosted on a different server
app.use(express.json()) // parses incoming json from the frontend which is handled using the req parameter

app.get("/api/get-cookie", async (req, res)=>{
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
        res.json({message: "Cookie set successfully"})
    }catch(err){
        res.status(500).json({error: "Error fetching JWT"})
    }
})

app.get("/api/protected-route", (req, res)=>{
    const token=req.cookies.api_token
    if(!token){ // expiration age for the cookie is set as one hour so if the cookie expires then this becomes true and if the response status is 401 the frontend refreshed the token and cookie.
        return res.status(401).json({error: "No token found"})
    }
    res.json({token})
})

app.listen(PORT, ()=>{
    console.log("server listening on Port 5000")
})