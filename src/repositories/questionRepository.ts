import { Question, IQuestion } from '@models/question';

export class QuestionRepository {
  public async create(data: Partial<IQuestion>): Promise<IQuestion> {
    const question = new Question(data);
    return await question.save();
  }

  public async findAll(): Promise<IQuestion[]> {
    return await Question.find();
  }

  public async findById(id: string): Promise<IQuestion | null> {
    return await Question.findById(id);
  }

  public async updateById(id: string, data: Partial<IQuestion>): Promise<IQuestion | null> {
    return await Question.findByIdAndUpdate(id, data, { new: true });
  }

  public async findWithPagination(skip: number, limit: number): Promise<IQuestion[]> {
    return Question.find()
      .skip(skip)
      .limit(limit);
  }

  public async countAll(): Promise<number> {
    return Question.countDocuments();
  }

  public async findByEvaluationId(evaluationId: string): Promise<IQuestion[]> {
    return await Question.find({ evaluationId: evaluationId, });
  }

  public async findByIdAndEvaluationId(questionId: string, evaluationId: string): Promise<IQuestion | null> {
    return await Question.findOne({
      _id: questionId,
      evaluationId: evaluationId,
    });
  }

  public async addAnswerToQuestion(questionId: string, answerId: string): Promise<void> {
    await Question.findByIdAndUpdate(
      questionId,
      { $push: { answers: answerId } },
      { new: true }
    );
  }
}

export const repository = new QuestionRepository();
