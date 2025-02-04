const compressbtn=document.querySelector("#compress")
const compressInput=document.querySelector("#compress-input")
const splitbtn=document.querySelector("#split")
const splitInput=document.querySelector("#split-input")

const PUBLIC_KEY='project_public_a07c1ecdfedc60c0c2526a6683da46a2_qbUwZ9aefe20d9b8785be481d001c3aa97a10'
const SECRET_KEY='secret_key_2512854c848aa25009ebf990b3608df8_GXNZu2c38c7bb9742847df64f32491ad72b4c'
const token='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuaWxvdmVwZGYuY29tIiwiYXVkIjoiIiwiaWF0IjoxNzM4NjU5MTM0LCJuYmYiOjE3Mzg2NTkxMzQsImV4cCI6MTczODY2MjczNCwianRpIjoicHJvamVjdF9wdWJsaWNfYTA3YzFlY2RmZWRjNjBjMGMyNTI2YTY2ODNkYTQ2YTJfcWJVd1o5YWVmZTIwZDliODc4NWJlNDgxZDAwMWMzYWE5N2ExMCJ9.hgYA76x94sTHID3YAyQmePHmcnpCm7RbZxhQE6UUkZ0'

compressbtn.addEventListener("click", ()=>{
    compressInput.click() //simulates a button click for the input element when the compress button is clicked
})

//compress functionality
compressInput.addEventListener("change", async(event)=>{
    try{
        const file=event.target.files[0]
        console.log(file.name)

        // starting the server returns the task id and the server we are supposed to upload the file to
        const {server:uploadServer, task:taskId}=await sendRequest("https://api.ilovepdf.com/v1/start/compress", {
            method:"GET",
            headers:{
                "Content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
        console.log(uploadServer)
        console.log(taskId)

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
        console.log(server_filename)

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
        console.log(processStatus)
        
        // Sending a GET request for downloading. The response is an object with a parameter called the body which contains the readable stream of the compressed PDF.
        const downloadResponse=await fetch(`https://${uploadServer}/v1/download/${taskId}`, {            
            method:"GET",
            headers:{
                "Authorization": `Bearer ${token}`,
            }
        })
        const readableStream=downloadResponse.body

        // To download the file we have to convert the readable stream into a blob
        const blob=await streamToBlob(readableStream)
        downloadFile(blob, `${file.name.slice(0, file.name.length-4)}_compressed.pdf`)
        
    }catch(err){
        console.log(err)
    }
})

// split functionality
splitbtn.addEventListener("click", ()=>{
    splitInput.click()
})

splitInput.addEventListener("change", ()=>{
    
})

// Essential functions
async function sendRequest(url, options){
    const request=new Request(url, options)
    const response=await fetch(request)
    const data=await response.json()
    return data
}

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

async function downloadFile(blob, filename){
    const link=document.createElement('a') 
    const downloadURL=URL.createObjectURL(blob)
    link.href=downloadURL
    link.download=filename
    link.click()
}
