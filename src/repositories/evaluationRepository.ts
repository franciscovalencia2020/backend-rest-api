import { Evaluation, IEvaluation } from '@models/evaluation';
import { Employee } from '@models/employee';

export class EvaluationRepository {
    public async create(data: Partial<IEvaluation>): Promise<IEvaluation> {
        const evaluation = new Evaluation(data);
        return await evaluation.save();
    }

    public async findAll(): Promise<IEvaluation[]> {
        return await Evaluation.find();
    }

    public async findById(id: string): Promise<IEvaluation | null> {
        return await Evaluation.findById(id);
    }

    public async findByIdWithPopulate(id: string): Promise<IEvaluation | null> {
        return await Evaluation.findById(id)
            .populate({
                path: 'questions',
                populate: {
                    path: 'answers',
                    model: 'Answer'
                }
            });
    }

    public async updateById(id: string, data: Partial<IEvaluation>): Promise<IEvaluation | null> {
        return await Evaluation.findByIdAndUpdate(id, data, { new: true });
    }

    public async findWithPagination(skip: number, limit: number): Promise<IEvaluation[]> {
        return Evaluation.find()
            .skip(skip)
            .limit(limit);
    }

    public async countAll(): Promise<number> {
        return Evaluation.countDocuments();
    }

    public async addQuestionsToEvaluation(evaluationId: string, questionIds: string[]): Promise<void> {
        await Evaluation.findByIdAndUpdate(
            evaluationId,
            { $push: { questions: { $each: questionIds } } }
        );
    }

    public async findPendingEvaluations(): Promise<IEvaluation[]> {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return await Evaluation.find({
            status: 'pending',
            $or: [
                { lastNotifiedAt: { $lt: oneDayAgo } },
                { lastNotifiedAt: null }
            ]
        });
    }

    public async findByEmployeeId(employeeId: string) {
        return await Evaluation.find({ employeeId });
    }

    public async findEvaluationsByDepartment(department: string): Promise<IEvaluation[]> {
        const employees = await Employee.find({ department }, '_id');
        const employeeIds = employees.map(employee => employee._id);
        return await Evaluation.find({ employeeId: { $in: employeeIds } }).populate('employeeId reviewerId');
    }
}

export const repository = new EvaluationRepository();
