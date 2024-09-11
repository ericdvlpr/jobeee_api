const express = require('express');
const app = express();
const dotenv = require('dotenv')
//config env
dotenv.config({path:'./config/config.env'})

const connectDatabase = require('./config/database')


//connecting to database
connectDatabase();

//bodyparse
app.use(express.json());
//routes
const jobs = require('./routes/jobs');

app.use('/api/v1',jobs);

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.` );
})