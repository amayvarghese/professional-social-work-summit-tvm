import { Schema, models, model } from "mongoose";

export interface IParticipant {
  name: string;
  mobile: string;
  email: string;
  shareId?: string;
  createdAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    shareId: { type: String, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Participant =
  models.Participant || model<IParticipant>("Participant", ParticipantSchema);
