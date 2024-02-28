import express from "express"
import usersRouter from "./routes/users"
import messagesRouter from "./routes/messages"
const app= express()
app.use('/users', usersRouter)
app.use('/messages', messagesRouter)
app.listen(3000, () => console.log('server ready on port 3000'))



