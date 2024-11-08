import { Answer, IAnswer } from '@models/answer';

export class AnswerRepository {

    public async create(answerData: Partial<IAnswer>): Promise<IAnswer> {
        const answer = new Answer(answerData);
        return await answer.save();
    }

    public async findByEvaluationId(evaluationId: string): Promise<IAnswer[]> {
        return await Answer.find({ evaluationId }).populate('questionId');
    }

    public async findAllByQuestionId(questionId: string): Promise<IAnswer[]> {
        return await Answer.find({ questionId });
    }

    public async findByQuestionId(questionId: string): Promise<IAnswer> {
        return await Answer.findOne({ questionId });
    }

    public async deleteByEvaluationId(evaluationId: string): Promise<number> {
        const result = await Answer.deleteMany({ evaluationId });
        return result.deletedCount || 0;
    }

    public async updateAnswer(answerId: string, updateData: Partial<IAnswer>): Promise<IAnswer | null> {
        return await Answer.findByIdAndUpdate(answerId, updateData, { new: true });
    }
}

export const repository = new AnswerRepository();
