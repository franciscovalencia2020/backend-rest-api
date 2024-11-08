import { Schema, model, Document } from 'mongoose';

interface IAnswer extends Document {
  evaluationId: Schema.Types.ObjectId;
  questionId: Schema.Types.ObjectId;
  answerText: string;
  score: number;
  createdAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  evaluationId: { type: Schema.Types.ObjectId, ref: 'Evaluation', required: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  answerText: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 10 },
  createdAt: { type: Date, default: Date.now }
});

const Answer = model<IAnswer>('Answer', answerSchema);

export { Answer, IAnswer };
