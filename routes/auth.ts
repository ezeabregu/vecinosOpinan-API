import { Router } from "express";
import {
  login,
  register,
  verifyUser,
  commentUser,
  userComments,
  commentFind,
  commentDelete,
  likes,
} from "../controllers/auth";
import { check } from "express-validator";
import { collectErrors } from "../middlewares/collectErrors";
import { mailExist } from "../helpers/validationsDB";

const router = Router();

router.post(
  "/register",
  [
    check("name", "El nombre es obligatorio.").not().isEmpty(),
    check("email", "El correo electrónico es obligatorio.").isEmail(),
    check(
      "password",
      "La contraseña debe ser de 6 caracteres mínimo."
    ).isLength({ min: 6 }),
    check("email").custom(mailExist),
    collectErrors,
  ],
  register
);

router.post(
  "/login",
  [
    check("email", "El correo electrónico es obligatorio.").not().isEmpty(),
    check("email", "El correo electrónico no es válido.").isEmail(),
    check("password", "El password debe ser de 6 caracteres mínimo.").isLength({
      min: 6,
    }),
    collectErrors,
  ],
  login
);

router.patch(
  "/verify",
  [
    check("email", "El correo electrónico es obligatorio").not().isEmpty(),
    check("email", "El correo electrónico no es válido").isEmail(),
    check("code").not().isEmpty(),
    collectErrors,
  ],
  verifyUser
);

router.patch(
  "/comment",
  [
    check("email", "El correo electrónico es obligatorio").not().isEmpty(),
    check("idNeighborhood").not().isEmpty(),
    check("rating").not().isEmpty(),
    check("comment").not().isEmpty(),
    collectErrors,
  ],
  commentUser
);

router.get("/userComments", [collectErrors], userComments);

router.get("/commentFind", [collectErrors], commentFind);

router.delete("/commentDelete", [collectErrors], commentDelete);

router.patch("/likes", [collectErrors], likes);

export default router;
