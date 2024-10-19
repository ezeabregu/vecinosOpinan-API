import { Response, Request } from "express";
import User, { IUser } from "../models/user";
import bcryptjs from "bcryptjs";
import { createJWT } from "../helpers/createJWT";
import randomsting from "randomstring";
import { sendEmail } from "../mailer/mailer";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

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
  const { email, idNeighborhood, rating, comment, person } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      res.status(404).json({ msg: "No se encontró el mail en la DB." });
      return;
    }

    if (!Array.isArray(usuario.comments)) {
      usuario.comments = []; // Inicializa comments si no está definido
    }

    // if (!usuario.comments) {
    //   usuario.comments = []; // Inicializa comments si no está definido
    // }

    usuario.comments.push({
      id: uuidv4(),
      idNeighborhood,
      rating,
      date: new Date(),
      comment,
      person,
    });
    await usuario.save(); // Guardar los cambios
    res.status(202).json({ msg: "Comentario guardado con éxito.", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor." });
  }
};

export const userComments = async (req: Request, res: Response) => {
  const { email } = req.query;
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

export const commentFind = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { idNeighborhood } = req.query;
    const usuarios = await User.find();

    const comentarios = usuarios.flatMap((usuario) =>
      usuario.comments?.filter(
        (comment) => Number(comment.idNeighborhood) === Number(idNeighborhood)
      )
    );

    if (!comentarios.length) {
      return res
        .status(404)
        .json({ message: "No se encontraron comentarios para este barrio." });
    }

    res.status(200).json({ comments: comentarios });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los comentarios.", error });
  }
};

export const commentDelete = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id, email } = req.query;
    const usuario = await User.findOne({ email });

    if (!usuario) {
      res.status(404).json({
        msg: "No se encontró el mail en la Base de Datos.",
        usuario,
      });
      return;
    }

    if (usuario) {
      if (Array.isArray(usuario.comments)) {
        const commentIndex = usuario.comments?.findIndex(
          (comment) => comment.id.toString() === id
        );
        if (commentIndex > -1) {
          usuario.comments.splice(commentIndex, 1);
          await usuario.save();
          return res.status(200).json({ message: "Comentario eliminado." });
        } else {
          return res.status(404).json({ message: "Comentario no encontrado." });
        }
      } else {
        return res
          .status(400)
          .json({ message: "El campo comments no es un arreglo." });
      }
    }
  } catch (error) {
    console.error("Error en commentDelete:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el comentario.", error });
  }
};
