const compressbtn=document.querySelector("#compress")
const compressInput=document.querySelector("#compress-input")
const splitbtn=document.querySelector("#split")
const splitInput=document.querySelector("#split-input")

const PUBLIC_KEY='project_public_a07c1ecdfedc60c0c2526a6683da46a2_qbUwZ9aefe20d9b8785be481d001c3aa97a10'
const SECRET_KEY='secret_key_2512854c848aa25009ebf990b3608df8_GXNZu2c38c7bb9742847df64f32491ad72b4c'
const token='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuaWxvdmVwZGYuY29tIiwiYXVkIjoiIiwiaWF0IjoxNzM4NjA0NDQwLCJuYmYiOjE3Mzg2MDQ0NDAsImV4cCI6MTczODYwODA0MCwianRpIjoicHJvamVjdF9wdWJsaWNfYTA3YzFlY2RmZWRjNjBjMGMyNTI2YTY2ODNkYTQ2YTJfcWJVd1o5YWVmZTIwZDliODc4NWJlNDgxZDAwMWMzYWE5N2ExMCJ9.HGoE2Kx743fC2xEVP-LhgOaWt7i3IIe6capb1at4gVE'

compressbtn.addEventListener("click", ()=>{
    compressInput.click() //simulates a button click for the input element when the compress button is clicked
})

compressInput.addEventListener("change", async(event)=>{
    try{
        const file=event.target.files[0]

        console.log(file.name)

        const {server:uploadServer, task:taskId}=await startServer("https://api.ilovepdf.com/v1/start/compress", {
            method:"GET",
            headers:{
                "Content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })

        console.log(uploadServer)
        console.log(taskId)

        const formDataUpload=new FormData() // FormData should be used for uploading the files
        formDataUpload.append("task", taskId)
        formDataUpload.append("file", file)

        const {server_filename}=await uploadFile(`https://${uploadServer}/v1/upload`, {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`
            },
            body:formDataUpload
        })

        console.log(server_filename)

        const processRequestData=new FormData()
        processRequestData.append("task", taskId)
        processRequestData.append("tool", "compress")
        processRequestData.append("files", [
            {
                "server_filename":server_filename, 
                "filename":`${file.name}_compressed.pdf`
            }
        ])


        await uploadFile(`https://${uploadServer}/v1/process`, {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`
            },
            body:processRequestData
        })

        
        
    }catch(err){
        console.log(err)
    }
})

async function startServer(url, options){
    const request=new Request(url, options)
    const response=await fetch(request)
    const data=await response.json() // The response will contain the server where the file is to be uploaded and the task id
    return data
}

async function uploadFile(url, options){
    const request=new Request(url, options)
    const response=await fetch(request)
    const data=await response.json()
    return data
}

async function process(url, options){
    const request=new Request(url, options)
    const response=await fetch(request)
    const data=await response.json()
    console.log(data)
}

function downloadFile(compressed, compressedFilename){
    const obj=new Blob([compressed]) // contruct a blob with the compressed ArrayBuffer. Remember the parameter should be a list
    const link=document.createElement('a') 
    link.href=URL.createObjectURL(obj) // The href attribute is set to a URL which is created using the static method createObjectURL
    link.download=compressedFilename
    link.click()
}

splitbtn.addEventListener("click", ()=>{
    splitInput.click()
})

splitInput.addEventListener("change", ()=>{
    
})