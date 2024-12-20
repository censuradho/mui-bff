import { Router } from "express";

import { AuthStoreUserRepository } from "@/domain/repositories/auth/storeuser/AuthStoreUser.repository";
import { StoreUserRepository } from "@/domain/repositories/storeUser/User.repository";

import { prisma } from "@/services/PrismaClient";

import { StoreRepository } from "@/domain/repositories/store/store.repository";
import { AuthStoreUserController } from "@/infra/controllers/auth/authStoreUser.controller";
import {
  authStoreUserSignUpWithEmailAndPasswordValidation,
  isValidEmailValidation,
  sendEmailValidationTokenByEmailRequestBodyValidation,
  signInWithEmailAndPasswordRequestBodyValidation
} from "@/infra/middleware/auth/authStoreUser.validation";
import { storeUserJwtMiddleware } from "@/infra/middleware/auth/storeUserJWT.middleware";
import { CloudflareR2Service } from "@/services/CloudflareR2.service";
import { EmailValidationTokenRepository } from "@/domain/repositories/emailValidationToken/EmailValidationToken.repository";
import { MailchimpTransactionalService } from "@/services/MailchimpTransactional.service";

const authStoreUserRoute = Router()

const repository = new AuthStoreUserRepository(
  new StoreUserRepository(prisma), 
  new StoreRepository(prisma, new CloudflareR2Service()),
  new EmailValidationTokenRepository(prisma),
  new MailchimpTransactionalService()
)

const controller = new AuthStoreUserController(repository)

// Protect routes
authStoreUserRoute.post(
  '/store-user/register',
  authStoreUserSignUpWithEmailAndPasswordValidation, 
  controller.signUpWithEmailAndPassword.bind(controller)
)

authStoreUserRoute.post(
  '/store-user/login', 
  signInWithEmailAndPasswordRequestBodyValidation,
  controller.signInWithEmailAndPassword.bind(controller)
)

authStoreUserRoute.get(
  '/store-user/me', 
  storeUserJwtMiddleware,
  controller.me.bind(controller)
)


authStoreUserRoute.get(
  '/store-user/resend-email-validation', 
  storeUserJwtMiddleware,
  controller.resendEmailValidation.bind(controller)
)

authStoreUserRoute.post(
  '/store-user/email-validation', 
  isValidEmailValidation, 
  controller.isValidEmail.bind(controller)
)

authStoreUserRoute.get(
  '/store-user/logout', 
  controller.logout.bind(controller)
)

authStoreUserRoute.post(
  '/store-user/resend-email-validation', 
  sendEmailValidationTokenByEmailRequestBodyValidation,
  controller.resendEmailValidationByEmail.bind(controller)
)

authStoreUserRoute.get(
  '/store-user/email-validation/:token', 
  controller.verifyEmailValidationIntegrityByToken.bind(controller)
)

export {
  authStoreUserRoute
};
