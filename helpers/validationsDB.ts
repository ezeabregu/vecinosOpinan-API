import { sendEmail } from "../mailer/mailer";
import User, { IUser } from "../models/user";

export const mailExist = async (email: string): Promise<void> => {
  const mailExist: IUser | null = await User.findOne({ email });
  if (mailExist && mailExist.verified) {
    throw new Error(`El correo electrónico ${email} ya está registrado.`);
  }
  if (mailExist && !mailExist.verified) {
    await sendEmail(email, mailExist.code as string);
    throw new Error(
      `El usuario ya está registrado. Se envió nuevamente el código de verificaión a ${email}`
    );
  }
};
