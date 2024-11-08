import mongoose from 'mongoose';
import config from '@config/config';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(`${config.dbUri}/${config.dbName}`);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
