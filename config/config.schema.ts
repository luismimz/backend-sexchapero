import * as Joi from 'joi';
export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  DATABASE_URL: Joi.string().uri().required(),
  //Magic Link Config Smtp
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  MAIL_FROM: Joi.string().email().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  // Email Config
  //EMAIL_USER: Joi.string().email().required(),
  //EMAIL_PASS: Joi.string().required(),
  // Other environment variables can be added here
})