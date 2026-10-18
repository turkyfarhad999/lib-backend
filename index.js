import 'dotenv/config'
import express from 'express'
import { PrismaClient } from './generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import { error } from 'node:console';
const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL,
  connectionTimeoutMillis: 30000,
});
const prisma=new PrismaClient({adapter})
const app =express()
app.use(express.json())
app.get('/',(req,res)=>{
    res.send("server activated")
})
//All books options
app.get('/books', async (req, res) => {
  try {
    const books = await prisma.books.findMany()
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/books',async(req,res)=>{
  try{const { Name , Author, Catagory , copies }=req.body
  const count = Number(copies)
  if(!Name || ! Author || !Catagory || !Number.isInteger(count)||count <1){
    return res.status(400).json({error:'need to add field'})
  }
  const book = await prisma.books.create({
    data:{
      Name,
      Author,
      Catagory,
      Copies: {create:Array.from({length:count},()=>({}))}
    },
    include: {Copies:true},
  })
  res.status(201).json(book)
}catch(error){
      res.status(500).json({ error: error.message })

}
})
//All copies books
app.get('/category',async(req,res)=>{
  try{
    const copies= await prisma.copiesBooks.findMany()
    res.json(copies)
  }catch(error){
    console.error(error)
    res.status(500).json({error:error.message})
  }
})
//All users option
app.get('/user',async(req,res)=>{
  try {
    const users=await prisma.user.findMany()
    res.json(users)
  } catch(error){
    console.error(error)
    res.status(500).json({error:error.message})
  }

})
//All loans
app.get('/loans',async(req,res)=>{
  try {
    const users=await prisma.loan.findMany()
    res.json(users)
  } catch(error){
    console.error(error)
    res.status(500).json({error:error.message})
  }

})

app.listen(8000,()=>{
    console.log("server is running on 8000 ")
})
