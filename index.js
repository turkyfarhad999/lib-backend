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
    const books = await prisma.books.findMany({
      include:{Copies:true}
    })
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
app.patch('/books/:id',async(req,res)=>{
  const id = Number(req.params.id)
  const book = await prisma.books.findUnique({where:{id}})
  const updatedBooks= await prisma.books.update({
    where:{id},
    data:{
      Name:req.body.Name,
      Author:req.body.Author,
      Catagory:req.body.Catagory

    }
  })
  res.send(updatedBooks)
})
app.delete('/books/:id',async(req,res)=>{
  const id = Number(req.params.id)
 const targetedData= await prisma.books.findUnique({
  where:{id},
  include:{Copies:true}
 })
 const checkActive=targetedData.Copies.every(target=>target.Status==='ACTIVE')
 if(!checkActive){
  return res.status(400).json({message:"some copy are still in loan"})
 }
 await prisma.$transaction(async(tx)=>{
  await tx.copiesBooks.deleteMany({
    where:{bookId:id}
  })
  await tx.books.delete({
    where:{id}
  })
 })
 return res.json({
  message:"successfully deleted"
 })
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
app.post('/books/:id/copies',async(req,res)=>{
  try{
   const bookId=Number(req.params.id)
   const count=Number(req.body.count)
   const result = await prisma.copiesBooks.createMany({
    data: Array.from({length:count},()=>({bookId}))
   })
   res.status(201).json({added:result.count})
  }catch(error){
    console.error(error)
    res.status(500).json({error:error.message})
  }
  
  
})
app.patch('/category/:id',async(req,res)=>{
  const id = Number(req.params.id)
  const updatecat= await prisma.copiesBooks.update({
    where:{id},
    data:{
      Status:req.body.Status
    }

  })
  res.send(updatecat)
})
app.delete('/category/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid copy id' })
    }

    await prisma.copiesBooks.delete({
      where: { id, Status: 'ACTIVE' },
    })
    res.json({ deleted: true })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(409).json({ error: 'Copy not found or not ACTIVE. Only ACTIVE copies can be deleted.' })
    }
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'This copy has loan records and cannot be deleted.' })
    }
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})
//All users option
app.get('/user',async(req,res)=>{
  try {
    const users=await prisma.user.findMany({
      include:{loan:true}
    })
    res.json(users)
  } catch(error){
    console.error(error)
    res.status(500).json({error:error.message})
  }

})
//All loans
app.get('/loans',async(req,res)=>{
  try {
    const users=await prisma.loan.findMany({
      include:{copies:true,user:true}
    })
    
    res.json(users)
  } catch(error){
    console.error(error)
    res.status(500).json({error:error.message})
  }

})
app.post('/loans', async (req, res) => {
  try {
    const { userId, newUser, bookIds, returnDate } = req.body
    if (!bookIds?.length || !returnDate || (!userId && !newUser)) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const loans = await prisma.$transaction(async (tx) => {
      let memberId = userId
      if (newUser) {
        const user = await tx.user.create({
          data: { name: newUser.name.trim(), email: newUser.email.trim().toLowerCase() },
        })
        memberId = user.id
      }

      const created = []
      for (const bookId of bookIds.map(Number)) {
        const copy = await tx.copiesBooks.findFirst({
          where: { bookId, Status: 'ACTIVE' },
          orderBy: { id: 'asc' },
        })
        if (!copy) throw new Error('NO_COPY')

        await tx.copiesBooks.update({
          where: { id: copy.id },
          data: { Status: 'ONLOAN' },
        })
        const loan = await tx.loan.create({
          data: { CbookId: copy.id, UserId: memberId, returnDate: new Date(returnDate) },
        })
        created.push(loan)
      }
      return created
    })

    res.status(201).json(loans)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A member with this email already exists. Please select the existing member.' })
    }
    if (error.message === 'NO_COPY') {
      return res.status(409).json({ error: 'No copy available for a selected book.' })
    }
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})
app.patch('/loans/:id/return', async (req, res) => {
  try {
    const FINE_PER_DAY = 5
    const dhakaDay = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit',
    })
    const dayNum = (s) => {
      const [y, m, d] = s.split('-').map(Number)
      return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
    }

    const id = Number(req.params.id)
    const { returnDate, payNow } = req.body
    if (!Number.isInteger(id) || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate || '')) {
      return res.status(400).json({ error: 'Invalid loan id or return date' })
    }
    const submit = new Date(`${returnDate}T00:00:00+06:00`)
    if (Number.isNaN(submit.getTime())) {
      return res.status(400).json({ error: 'Invalid return date' })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id } })
      if (!loan) throw new Error('NOT_FOUND')
      if (loan.SubmitDate) throw new Error('ALREADY_RETURNED')
      if (dayNum(returnDate) < dayNum(dhakaDay.format(loan.CreatedDate))) {
        throw new Error('BEFORE_LOAN')
      }

      const lateDays = Math.max(0, dayNum(returnDate) - dayNum(dhakaDay.format(loan.returnDate)))
      const fine = lateDays * FINE_PER_DAY

      const result = await tx.loan.updateMany({
        where: { id, SubmitDate: null },
        data: {
          SubmitDate: submit,
          fineAmount: fine,
          findeDue: fine > 0 && !payNow, // pay now / no fine => false, pay later => true
        },
      })
      if (result.count === 0) throw new Error('ALREADY_RETURNED')

      await tx.copiesBooks.update({
        where: { id: loan.CbookId },
        data: { Status: 'ACTIVE' },
      })
      return tx.loan.findUnique({ where: { id } })
    })

    res.json(updated)
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Loan not found' })
    if (error.message === 'ALREADY_RETURNED') return res.status(409).json({ error: 'This book has already been returned' })
    if (error.message === 'BEFORE_LOAN') return res.status(400).json({ error: 'Return date cannot be before the loan date' })
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.patch('/loans/:id/pay-fine', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await prisma.loan.updateMany({
      where: { id, findeDue: true, SubmitDate: { not: null } },
      data: { findeDue: false }, // fineAmount stays for history
    })
    if (result.count === 0) {
      return res.status(409).json({ error: 'No unpaid fine on this loan' })
    }
    res.json({ paid: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(8000,()=>{
    console.log("server is running on 8000 ")
})
