import { Schema, model, Document } from 'mongoose';

interface IQuestion extends Document {
  evaluationId: Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
  answers: Schema.Types.ObjectId[];
}

const questionSchema = new Schema<IQuestion>({
  evaluationId: { type: Schema.Types.ObjectId, ref: 'Evaluation', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }]
});

const Question = model<IQuestion>('Question', questionSchema);

export { Question, IQuestion };
