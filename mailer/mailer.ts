import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vecinosopinan@gmail.com",
    pass: "v3c1n0s0p1n4n",
  },
  from: "vecinosopinan@gmail.com",
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (to: string, code: string): Promise<void> => {
  const mailOptions = {
    from: '"Vecinos Opinan" vecinosopinan@gmail.com',
    to,
    subject: "Código de verificación para Vecinos Opinan",
    text: `
            Llegó tu codigo para Vecinos Opinan.
            El código es ${code}
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo electrónico enviado");
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};
