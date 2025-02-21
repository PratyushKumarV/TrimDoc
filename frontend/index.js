import {PDFDocument} from "./libs/pdf-lib.esm.min.js" // getting minified es6 pdf-lib file for calculating number of pages for split functionality

const compressbtn=document.querySelector("#compress")
const compressInput=document.querySelector("#compress-input")
const splitbtn=document.querySelector("#split")
const splitInput=document.querySelector("#split-input")
const submitbtn=document.querySelector("#submit-btn")
const cancelbtn=document.querySelector("#cancel-btn")
const fromEl=document.querySelector("#from")
const toEl=document.querySelector("#to")

let token=null
let cachedToken=null

// UI elements toggle
function showLoader(){
    document.querySelector(".loader").classList.remove("hidden") // removes the hidden class in the selected element
}

function hideLoader(){
    document.querySelector(".loader").classList.add("hidden") // adds the hidden class in the selected element
}

function showSplit(){
    document.querySelector(".split-dialog").classList.remove("hidden")
}

function hideSplit(){
    document.querySelector(".split-dialog").classList.add("hidden")
}

// Button event listeners
compressbtn.addEventListener("click", ()=>{
    compressInput.click() 
})

compressInput.addEventListener("change", async(event)=>{
    try{
        await getValidToken()
        compress(event, token)
    }catch(error){
        console.log(error)
    }
})

splitbtn.addEventListener("click", ()=>{
    splitInput.click()
})

let abortController=new AbortController() // Web API that can be used for aborting asynchronous operations

//cancel button for split
cancelbtn.addEventListener("click", ()=>{
    fromEl.value=''
    toEl.value=''
    hideSplit()
    abortController.abort() // creates a signal
    abortController=new AbortController()
})

splitInput.addEventListener("change", async(event)=>{
    try{
        await getValidToken()
        split(event, token)
    }catch(error){
        console.log(error)
    }
})



// Essential functions

//compress functionality
async function compress(event, token){
    try{
        const file=Array.from(event.target.files)
        if(file.length==0){
            return
        }
        compressInput.value="" // resetting because if it is not done then it is not possible to select the same file for the same operation contiguously
        showLoader()
        const downloadableBlob=[]

        // The map function is applied to an array and it accepts a callback whose argument is each element in the array
        Promise.all(file.map(async function(file){
            // starting the server returns the task id and the server we are supposed to upload the file to
            const {server:uploadServer, task:taskId}=await sendRequest("https://api.ilovepdf.com/v1/start/compress", {
                method:"GET",
                headers:{
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            })

            // For uploading the file from the local system we have to use a FormData object
            const formDataUpload=new FormData() // FormData should be used for uploading the files
            formDataUpload.append("task", taskId)
            formDataUpload.append("file", file)
            const {server_filename}=await sendRequest(`https://${uploadServer}/v1/upload`, {
                method:"POST",
                headers:{
                    "Authorization": `Bearer ${token}`
                },
                body:formDataUpload
            })

            // For proccessing the uploaded file we have to upload a JSON object
            const processRequestData={
                task:taskId,
                tool:"compress",
                files:[
                    {
                        server_filename: server_filename,
                        filename: `${file.name.slice(0, file.name.length-4)}_compressed.pdf`
                    }
                ]
            }
            const processStatus=await sendRequest(`https://${uploadServer}/v1/process`, {
                method:"POST",
                headers:{
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(processRequestData)
            })
            
            // Sending a GET request for downloading. The response is an object with a parameter called the body which contains the readable stream of the compressed PDF.
            const downloadResponse=await fetch(`https://${uploadServer}/v1/download/${taskId}`, {            
                method:"GET",
                headers:{
                    "Authorization": `Bearer ${token}`,
                }
            })
            const readableStream=downloadResponse.body

            // To download the file we have to convert the readable stream into a blob
            downloadableBlob.push([await streamToBlob(readableStream), processStatus.download_filename]) // storing the results in this format because for downloading we need the blob and the filename
        })).then(()=>{
            hideLoader()
            downloadableBlob.forEach(([blob, filename])=>{
                downloadFile(blob, filename)
                console.log(`Donwloaded file ${filename}`)
            })
        })
    }catch(err){
        console.log(err)
    }
}

// split functionality
async function split(event, token){
    try{
        const file=event.target.files[0]
        if(!file){
            return
        }
        splitInput.value=""
        showSplit()
        const numberOfPages=await getPageNumber(file)
        // promise.race can be used to find if the operation is aborted first or if the user has submitted values
        const [from, to]=await Promise.race([
            getFromTo(),
            new Promise((resolve, reject)=>{
                abortController.signal.addEventListener("abort", ()=>{
                    reject("Process Cancelled")
                })
            })
        ])

        validateRange(from, to, numberOfPages)
        if(abortController.signal.aborted){
            window.alert("Invalid range")
            console.log("Process cancelled")
            abortController=new AbortController() // reset the abort controller
            return
        }

        showLoader()

        const {server: uploadServer, task:taskId}=await sendRequest("https://api.ilovepdf.com/v1/start/split", {
            method:"GET",
            headers:{
                "Content-type":"application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        
        const formDataUpload=new FormData()
        formDataUpload.append("task", taskId)
        formDataUpload.append("file", file)
        const {server_filename}=await sendRequest(`https://${uploadServer}/v1/upload`, {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`
            },
            body:formDataUpload
        })

        const processRequestData={
            task: taskId,
            tool:"split",
            files:[
                {
                    server_filename:server_filename,
                    filename:`${file.name.slice(0, file.name.length-4)}.pdf`
                }
            ],
            ranges:`${from}-${to}`
        }

        const processStatus=await sendRequest(`https://${uploadServer}/v1/process`,{
            method:"POST",
            headers:{
                "Authorization":`Bearer ${token}`,  
                "Content-Type":"application/json"
            },
            body:JSON.stringify(processRequestData)
        })

        const downloadResponse=await fetch(`https://${uploadServer}/v1/download/${taskId}`, {            
            method:"GET",
            headers:{
                "Authorization": `Bearer ${token}`,
            }
        })
        
        const readableStream=downloadResponse.body
        
        const blob=await streamToBlob(readableStream)
        hideLoader()    
        downloadFile(blob, processStatus.download_filename)
        console.log(`Downloaded file ${processStatus.download_filename}`)

    }catch(err){
        console.log(err)
    }
}

// Token handling
async function getToken(){
    try{

        if(cachedToken){
            return cachedToken
        }

        // setting token as a cookie
        await fetch("http://localhost:5000/api/get-cookie", {
            method:"GET",
            credentials:"include" // ensures cookies are recieved on the browser
        })

        let response=await fetch("http://localhost:5000/api/protected-route", {
            method:"GET",
            credentials: "include" // includes cookie in the request
        })

        if(response.status===401){ // cookie expired
            console.log("Refreshing token")
            await fetch("http://localhost:5000/api/get-cookie", {
                method: "GET",
                credentials:"include"
            })
            response=await fetch("http://localhost:5000/api/protected-route",{
                method:"GET",
                credentials:"include"
            })
        }

        const tokenJSON=await response.json()
        cachedToken=tokenJSON.token
        return cachedToken

    }catch(error){
        throw  new Error(error)
    }
}

async function getValidToken(){
    if(!token){
        token=await getToken()
    }
    return token
}

//request handling
async function sendRequest(url, options){
    try{
        const request=new Request(url, options)
        const response=await fetch(request)
        const data=await response.json()
        return data
    }catch(error){
        throw new Error(error)
    }
}

// conversion of stream to blob
async function streamToBlob(readableStream){ // Converts a readable stream into a blob for downloading
    const reader=readableStream.getReader()
    const chunks=[]
    
    let done=false

    while(!done){
        const {value, done:isDone}=await reader.read()
        if(value){
            chunks.push(value)
        }
        done=isDone
    }

    return new Blob(chunks, {type: "application/pdf"})
}

// download blob
function downloadFile(blob, filename){
    const link=document.createElement('a') 
    const downloadURL=URL.createObjectURL(blob)
    link.href=downloadURL
    link.download=filename
    link.click()
    URL.revokeObjectURL(downloadURL)
}

async function getFromTo(){
    return new Promise((resolve, reject)=>{
        submitbtn.addEventListener("click", function handler(){
            resolve([parseInt(fromEl.value), parseInt(toEl.value)])
            submitbtn.removeEventListener("click", handler)
            fromEl.value=""
            toEl.value=""
            hideSplit()
        })
    })
}

function pageNumberPromise(file){
    return new Promise((resolve, reject)=>{
        const reader=new FileReader()

        reader.onload=()=>resolve(reader.result) // when these are encountered they are pushed to the web api
        reader.onerror=(error)=>reject(error) // same as onload. These functions get executed when the file reading is finished.

        reader.readAsArrayBuffer(file) // readAsArrayBuffer is an asyncrhonous operation. This is the reason why this is given after the above two web API functions
    })
}

async function getPageNumber(file){
    try{
        const arrayBuffer=await pageNumberPromise(file)
        const pdf=await PDFDocument.load(arrayBuffer)
        return pdf.getPageCount()
    }
    catch(error){
        throw new Error(error)
    }
}

// function to validate the range of the files given by the user
function validateRange(from, to, numberOfPages){
    if((from<0 || to<0) || (to<from) || (to>numberOfPages || from>=numberOfPages)){
        abortController.abort()
    }
}
