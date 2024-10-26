const express = require('express');
const app = express();
const dotenv = require('dotenv')
//config env
dotenv.config({path:'./config/config.env'})

const connectDatabase = require('./config/database')
const errorMiddleware = require('./middleware/errors')
const ErrorHandler = require('./utils/errorHandler')
//handling uncaught exception
process.on('uncaughtException',err =>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to  uncaught exception')
    process.exit(1);
})

//connecting to database
connectDatabase();

//bodyparse
app.use(express.json());
//routes
const jobs = require('./routes/jobs');

app.use('/api/v1',jobs);

//unhandled routes
app.all('*',(req,res,next) =>{
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

//middleware
app.use(errorMiddleware)

console.log(process.env.NODE_ENV)
const PORT = process.env.PORT;
const server = app.listen(PORT,()=>{
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.` );
})
process.on('unhandledRejection',err=>{
    console.log(`Error:${err.message}`);
    console.log('Shutting down the server due to unhandled promise')
    server.close(()=>{
        process.exit(1);
    })
})