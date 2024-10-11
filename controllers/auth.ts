import { Response, Request } from "express";
import User, { IUser } from "../models/user";
import bcryptjs from "bcryptjs";
import { createJWT } from "../helpers/createJWT";
import randomsting from "randomstring";
import { sendEmail } from "../mailer/mailer";

export const register = async (req: Request, res: Response) => {
  const { name, email, password }: IUser = req.body;
  const usuario = new User({ name, email, password });

  const salt = bcryptjs.genSaltSync();
  usuario.password = bcryptjs.hashSync(password, salt);
  const adminKey = req.headers["admin-key"];
  const newCode = randomsting.generate(6);
  usuario.code = newCode;
  await usuario.save();
  await sendEmail(email, newCode);
  res.status(201).json({
    usuario,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: IUser = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      res.status(404).json({
        msg: "No se encontró el mail en la DB.",
      });
      return;
    }
    const validatePassword = bcryptjs.compareSync(password, usuario.password);
    if (!validatePassword) {
      res.status(401).json({
        msg: "La contraseña es incorrecta.",
      });
      return;
    }
    const token = await createJWT(usuario.id);
    res.status(202).json({
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor.",
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      res.status(404).json({
        msg: "No se encontró el mail en la Base de Datos.",
        usuario,
      });
      return;
    }
    const token = await createJWT(usuario.id);
    if (usuario.verified) {
      res.status(400).json({
        msg: "El usuario ya está correctamente verificado.",
        usuario,
        token,
      });
      return;
    }
    if (code !== usuario.code) {
      res.status(401).json({
        msg: "El código ingresado no es correcto.",
        usuario,
      });
      return;
    }
    await User.findOneAndUpdate({ email }, { verified: true });
    res.status(200).json({
      msg: "Usuario verificado con éxito.",
      usuario,
      token,
    });
    await usuario.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor",
    });
  }
};

export const commentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, idNeighborhood, rating, comment } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      res.status(404).json({ msg: "No se encontró el mail en la DB." });
      return;
    }

    if (!usuario.comments) {
      usuario.comments = []; // Inicializa comments si no está definido
    }

    usuario.comments.push({
      idNeighborhood,
      rating,
      date: new Date(),
      comment,
    });
    await usuario.save(); // Guardar los cambios
    res.status(202).json({ msg: "Comentario guardado con éxito.", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor." });
  }
};

export const userComments = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      res.status(404).json({ msg: "No se encontró el mail en la DB." });
      return;
    }
    res.status(200).json({
      comments: usuario.comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor." });
  }
};
