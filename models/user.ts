import { Schema, model, Model } from "mongoose";

interface Icomment {
  id: String;
  idNeighborhood: Number;
  rating: Number;
  date: Date;
  comment: String;
  person: String;
}

export interface IUser {
  createdAt: Date;
  name: string;
  email: string;
  password: string;
  code?: string;
  verified?: string;
  comments?: Icomment[];
}

const UserSchema = new Schema<IUser>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "El nombre es obligatorio."],
  },
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio."],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria."],
  },
  code: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  comments: {
    type: [
      {
        id: { type: String },
        idNeighborhood: {
          type: Number,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        comment: {
          type: String,
          required: true,
        },
        person: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

UserSchema.methods.toJSON = function () {
  const { __v, password, _id, code, ...user } = this.toObject();
  return user;
};

const User: Model<IUser> = model<IUser>("User", UserSchema);
export default User;
