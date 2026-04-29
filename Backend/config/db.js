const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const con = async () => {
    //local database
    // try {
    //     let url = `mongodb://${process.env.DB_HOST}:${process.env.MONGOPORT}/${process.env.DB_NAME}`;

    //     await mongoose.connect(url, {
    //         useNewUrlParser : true,
    //     });

    //     console.log(`connected To Mongodb database : ${process.env.DB_NAME}`);
    // } catch (error) {
    //     console.error(error.message);
    //     process.exit();
    // }

    //Online database
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`connected To Mongodb database ${conn.connection.host}`);
    } catch (error) {
        console.error(error.message);
        console.log("Database connecting error.")
        process.exit();
    }
}

module.exports = con;