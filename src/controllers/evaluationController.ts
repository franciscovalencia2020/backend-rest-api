import { Request, Response } from 'express';
import { repository as EvaluationRepository } from '@repositories/evaluationRepository';
import { repository as QuestionRepository } from '@repositories/questionRepository';
import { repository as AnswerRepository } from '@repositories/answerRepository';
import { repository as EmployeeRepository } from '@repositories/employeeRepository';
import { service as RedisService } from '@config/redis';
import { Messages } from '@utils/messages';
import { IAnswer } from '@models/answer';
import { DecodedToken } from '@utils/utils';
import { IEvaluation } from '@models/evaluation';
import redis from '@config/redis';

export class EvaluationController {

    public async createEvaluation(req: Request, res: Response): Promise<Response> {
        try {
            const { employeeId, period, type, reviewerId } = req.body;
            const existingEmployee = await EmployeeRepository.findById(employeeId);
            if (!existingEmployee) {
                return res.status(404).json({ message: Messages.EMPLOYEE_NOT_FOUND });
            }
            const existingReviewer = await EmployeeRepository.findById(reviewerId);
            if (!existingReviewer) {
                return res.status(404).json({ message: Messages.REVIEWER_NOT_FOUND });
            }
            const evaluation = await EvaluationRepository.create({ employeeId, period, type, reviewerId });
            await RedisService.clearEvaluationListings();
            return res.status(201).json({ evaluation, message: Messages.EVALUATION_CREATED_SUCCESS });
        } catch (error) {
            throw error;
        }
    }

    public async getAllEvaluations(req: Request, res: Response): Promise<Response> {
        try {

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const cacheKey = `evaluations:${page}:${limit}`;

            const cachedEvaluations = await redis.get(cacheKey);
            if (cachedEvaluations) {
                console.log('Datos obtenidos del caché');
                return res.json(JSON.parse(cachedEvaluations));
            }

            const skip = (page - 1) * limit;
            const evaluations = await EvaluationRepository.findWithPagination(skip, limit);
            const totalEvaluations = await EvaluationRepository.countAll();
            const totalPages = Math.ceil(totalEvaluations / limit);

            const response = {
                page,
                limit,
                totalPages,
                totalEvaluations,
                evaluations,
            };

            await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);

            return res.json(response);
        } catch (error) {
            throw error;
        }
    }

    public async getEvaluationById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const cacheKey = `evaluations:${id}`;
            const cachedEvaluation = await redis.get(cacheKey);
            if (cachedEvaluation) {
                console.log('Datos obtenidos del caché');
                return res.json(JSON.parse(cachedEvaluation));
            }

            const evaluation = await EvaluationRepository.findByIdWithPopulate(id);
            if (!evaluation) {
                return res.status(404).json({ message: Messages.EVALUATION_NOT_FOUND });
            }

            await redis.set(cacheKey, JSON.stringify(evaluation), 'EX', 600);

            return res.json(evaluation);
        } catch (error) {
            throw error;
        }
    }

    public async updateEvaluation(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { period, type, status } = req.body;
            const evaluation = await EvaluationRepository.updateById(id, { period, type, status });
            if (!evaluation) {
                return res.status(404).json({ message: Messages.EVALUATION_NOT_FOUND });
            }

            await RedisService.clearEvaluationListings();

            return res.json({ evaluation, message: Messages.EVALUATION_UPDATED_SUCCESS });
        } catch (error) {
            throw error;
        }
    }

    public async submitEvaluation(req: Request, res: Response): Promise<Response> {
        try {
            const { id: evaluationId } = req.params;
            const { answers } = req.body;

            const evaluation = await EvaluationRepository.findById(evaluationId);
            if (!evaluation) {
                return res.status(404).json({ message: Messages.EVALUATION_NOT_FOUND });
            }

            const { isValid, message } = this.checkValidUser(req, evaluation);
            if (!isValid) {
                return res.status(403).json({ message });
            }

            if (['in-progress', 'completed'].includes(evaluation.status)) {
                return res.status(400).json({ message: Messages.EVALUATION_ALREADY_SUBMITTED });
            }

            const answerPromises = answers.map(async (answer: Partial<IAnswer>) => {
                const question = await QuestionRepository.findByIdAndEvaluationId(String(answer.questionId), evaluationId);

                if (!question) {
                    return res.status(400).json({ message: `Question with ID ${answer.questionId} not found for this evaluation` });
                }

                const newAnswer = await AnswerRepository.create({
                    evaluationId: question.evaluationId,
                    questionId: answer.questionId,
                    answerText: answer.answerText,
                    score: 0,
                });

                await QuestionRepository.addAnswerToQuestion(question._id as string, newAnswer._id as string);

                return newAnswer;
            });

            await Promise.all(answerPromises);

            evaluation.status = 'in-progress';
            await evaluation.save();
            await RedisService.clearEvaluationListings();
            return res.status(201).json({ message: Messages.EVALUATION_SUBMITTED_SUCCESS });
        } catch (error) {
            throw error;
        }
    }

    public async evaluateEvaluation(req: Request, res: Response): Promise<Response> {
        try {
            const { id: evaluationId } = req.params;
            const { answers } = req.body;

            const evaluation = await EvaluationRepository.findByIdWithPopulate(evaluationId);
            if (!evaluation) {
                return res.status(404).json({ message: Messages.EVALUATION_NOT_FOUND });
            }

            const { isValid, message } = this.checkValidUser(req, evaluation, true);
            if (!isValid) {
                return res.status(403).json({ message });
            }

            if (evaluation.status !== 'in-progress') {
                return res.status(400).json({ message: Messages.EVALUATION_NOT_IN_PROGRESS });
            }

            const answerPromises = answers.map(async (answer: { questionId: string; score: number }) => {
                const existingAnswer = await AnswerRepository.findByQuestionId(answer.questionId);

                if (!existingAnswer) {
                    throw new Error(`Answer with question ID ${answer.questionId} not found for this evaluation`);
                }

                existingAnswer.score = answer.score;
                return await existingAnswer.save();
            });

            await Promise.all(answerPromises);

            evaluation.status = 'completed';
            const totalScore = answers.reduce((acc: number, answer: IAnswer) => acc + answer.score, 0);
            evaluation.totalScore = totalScore;
            await evaluation.save();
            await RedisService.clearEvaluationListings();
            return res.status(200).json({ message: Messages.EVALUATION_COMPLETED_SUCCESS, totalScore });
        } catch (error) {
            throw error;
        }
    }

    checkValidUser(req: Request & { user?: DecodedToken }, evaluation: IEvaluation, isReviewer = false): { isValid: boolean; message?: string } {
        const employeeId = req.user?.employeeId;
        if (isReviewer) {
            if (String(evaluation.reviewerId) !== String(employeeId)) {
                return { isValid: false, message: Messages.REVIEWER_NOT_ASSIGN_TO_EVALUATION };
            }
        } else {
            if (String(evaluation.employeeId) !== String(employeeId)) {
                return { isValid: false, message: Messages.EMPLOYEE_NOT_ASSIGN_TO_EVALUATION };
            }
        }

        return { isValid: true };
    }
}

export const controller = new EvaluationController();

