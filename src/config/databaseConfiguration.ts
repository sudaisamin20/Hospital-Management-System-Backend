import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI: string = process.env.MONGODB_URI || "";
console.log("MONGODB_URI:", MONGODB_URI);

const ConnectToMongoDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected Successfully`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
        } else {
            console.error('MongoDB Connection Error:', error);
        }
        process.exit(1);
    }
};

export default ConnectToMongoDB;
