import { PasswordRecoveryRepository } from "@/domain/repositories/passwordRecovery/PasswordRecovery.repository";
import { StoreUserRepository } from "@/domain/repositories/storeUser/User.repository";
import { MailchimpTransactionalService } from "@/services/MailchimpTransactional.service";
import { prisma } from "@/services/PrismaClient";
import { Router } from "express";
import { PasswordRecoveryController } from "../controllers/passwordRecovery.controller";
import { changePasswordValidation, generatePasswordRecoveryValidation } from "../middleware/passwordRecovery.validations";

const passwordRecoveryRouter = Router()

const repository = new PasswordRecoveryRepository(
  prisma,
  new StoreUserRepository(prisma),
  new MailchimpTransactionalService()
)

const controller = new PasswordRecoveryController(repository)

passwordRecoveryRouter.post(
  '/password-recovery',
  generatePasswordRecoveryValidation,
  controller.generate.bind(controller)
)

passwordRecoveryRouter.post(
  '/password-recovery/change',
  changePasswordValidation,
  controller.changePassword.bind(controller)
)

passwordRecoveryRouter.get(
  '/password-recovery/validate/:code',
  controller.validate.bind(controller)
)

export {
  passwordRecoveryRouter
}