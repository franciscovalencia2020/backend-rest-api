import { Schema, model, Document } from 'mongoose';

interface IEvaluation extends Document {
  employeeId: Schema.Types.ObjectId;
  reviewerId: Schema.Types.ObjectId;
  period: string;
  status: 'pending' | 'completed' | 'in-progress';
  type: string;
  createdAt: Date;
  questions: Schema.Types.ObjectId[];
  totalScore: number;
  lastNotifiedAt?: Date;
}

const evaluationSchema = new Schema<IEvaluation>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  period: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'in-progress'],
    default: 'pending'
  },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  totalScore: { type: Number, default: 0 },
  lastNotifiedAt: { type: Date, default: null }
});

const Evaluation = model<IEvaluation>('Evaluation', evaluationSchema);

export { Evaluation, IEvaluation };
