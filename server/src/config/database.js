import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prometheus');
    console.log(`MongoDB verbunden: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error(`MongoDB Verbindungsfehler: ${err}`);
    });

    return conn;
  } catch (error) {
    console.error(`Fehler bei der MongoDB-Verbindung: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;