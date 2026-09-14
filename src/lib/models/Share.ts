import { Schema, models, model } from "mongoose";

export interface IShare {
  shareId: string;
  participantId?: string;
  name: string;
  /** Image bytes. Vercel's filesystem is read-only, so shares live in the DB. */
  image: Buffer;
  contentType: string;
  createdAt: Date;
}

const ShareSchema = new Schema<IShare>(
  {
    shareId: { type: String, required: true, unique: true, index: true },
    participantId: { type: String },
    name: { type: String, required: true },
    image: { type: Buffer, required: true },
    contentType: { type: String, required: true, default: "image/jpeg" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Share = models.Share || model<IShare>("Share", ShareSchema);
