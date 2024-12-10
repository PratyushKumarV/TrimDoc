import { PDFDocument } from "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.esm.js" // destructure the object and get only the PDFDocument property
// A Link is used which gets the module from a CDN (Content Delivery Network) This is because there is some compatibility issue 
// of locally install npm libraries running on the browser

const compressbtn=document.querySelector("#compress")
const compressInput=document.querySelector("#compress-input")
const splitbtn=document.querySelector("#split")
const splitInput=document.querySelector("#split-input")


compressbtn.addEventListener("click", ()=>{
    compressInput.click() //simulates a button click for the input element when the compress button is clicked
})

compressInput.addEventListener("change", async(event)=>{
    const file=event.target.files[0] // when an argument is used with an event listener then the event gets stored in the argument
    const compressedFilename=file.name.slice(0,file.name.length-3)+"_compressed.pdf"
    try{
        const arrBuffer=await file.arrayBuffer() // arrayBuffer is a method of the Blob interface which converts files into ArrayBuffer
        const pdfDoc=await PDFDocument.load(arrBuffer) // loads ArrayBuffer data to a PDFDocument object
        const compressed=await pdfDoc.save()
        downloadFile(compressed, compressedFilename)
    }catch(err){
        console.log(err)
    }
    
})

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