import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_TEST_NAME: Joi.string().required(),
}).unknown(true);

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  jwtSecret: envVars.JWT_SECRET,
  port: envVars.PORT,
  dbUri: envVars.MONGO_URI,
  dbName: envVars.DB_NAME,
  dbTestName: envVars.DB_TEST_NAME,
};