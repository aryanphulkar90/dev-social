const express = require("express")

const app = express()

app.use("/test", (req,res)=>{
   res.end("ok") 
})

app.listen(3000, ()=>{
   console.log("server running")
})