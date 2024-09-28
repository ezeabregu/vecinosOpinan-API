import jwt from "jsonwebtoken";

export const createJWT = (id: string = ""): Promise<string> => {
  return new Promise((res, rej) => {
    const payload = { id };

    jwt.sign(
      //payload
      payload,
      //clave secreta
      process.env.KEY as string,
      //objeto de configuracion
      {
        expiresIn: "1h",
      },
      //callback de resolucion
      (err: Error | null, token: string | undefined) => {
        if (err) {
          console.log(err);
          rej("No se pudo generar el JWT");
        } else {
          res(token as string);
        }
      }
    );
  });
};
