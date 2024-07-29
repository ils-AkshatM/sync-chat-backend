import mongoose from 'mongoose';



const connectDB = () => {
    mongoose.connect(process.env.DATABASE_URL)
        .then(() => {
            console.log('Database connected succcessfully 🟢');
        })
        .catch(error => {
            console.log(`Error while connecting server with Database 🔴`);
            console.log(error);
            process.exit(1);
        });
};

export default connectDB;
