const mongoose = require('mongoose');

const connectDatabase = () => {mongoose.connect(process.env.DB_LOCAL_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    })
    .then(con =>{
    console.log(`Mongodb Database with host: ${con.connection.host}`);
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
}

module.exports = connectDatabase;