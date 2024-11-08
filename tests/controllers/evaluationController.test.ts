import { Request, Response } from 'express';
import { EvaluationController } from '../../src/controllers/evaluationController';
import { repository as EvaluationRepository } from '../../src/repositories/evaluationRepository';
import { repository as QuestionRepository } from '../../src/repositories/questionRepository';
import { repository as AnswerRepository } from '../../src/repositories/answerRepository';
import { repository as EmployeeRepository } from '../../src/repositories/employeeRepository';
import { service as RedisService } from '../../src/config/redis';
import { Messages } from '../../src/utils/messages';
import redis from '../../src/config/redis';

jest.mock('../../src/repositories/evaluationRepository');
jest.mock('../../src/repositories/questionRepository');
jest.mock('../../src/repositories/answerRepository');
jest.mock('../../src/repositories/employeeRepository');
jest.mock('../../src/config/redis');

describe('EvaluationController', () => {
    let controller: EvaluationController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let sendMock: jest.Mock;

    beforeEach(() => {
        controller = new EvaluationController();
        req = {};
        jsonMock = jest.fn();
        sendMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock })) as any;
        res = { status: statusMock, json: jsonMock, send: sendMock } as Partial<Response>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createEvaluation', () => {
        it('debería crear una nueva evaluación exitosamente y limpiar el caché', async () => {
            const mockEvaluation = { id: '1', employeeId: '672df51e647c5c73f659c477', period: '2023-Q1', type: 'Performance', reviewerId: '672df51e647c5c73f659c477' };
            const mockEmployee = { id: '672df51e647c5c73f659c477' };
            const mockReviewer = { id: '672df51e647c5c73f659c477' };

            (EmployeeRepository.findById as jest.Mock).mockImplementation((id) => {
                if (id === '672df51e647c5c73f659c477') return Promise.resolve(mockEmployee);
                return Promise.resolve(mockReviewer);
            });

            (EvaluationRepository.create as jest.Mock).mockResolvedValue(mockEvaluation);

            const clearCacheSpy = jest.spyOn(RedisService, 'clearEvaluationListings').mockResolvedValue();

            req.body = { employeeId: '672df51e647c5c73f659c477', period: '2023-Q1', type: 'Performance', reviewerId: '672df51e647c5c73f659c477' };

            await controller.createEvaluation(req as Request, res as Response);

            expect(EmployeeRepository.findById).toHaveBeenCalledWith('672df51e647c5c73f659c477');
            expect(EvaluationRepository.create).toHaveBeenCalledWith(req.body);
            expect(clearCacheSpy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                evaluation: mockEvaluation,
                message: Messages.EVALUATION_CREATED_SUCCESS,
            });

            clearCacheSpy.mockRestore();
        });

        it('debería retornar 404 si el empleado no existe', async () => {
            const mockReviewer = { id: '672df51e647c5c73f659c477' };

            (EmployeeRepository.findById as jest.Mock).mockImplementation((id) => {
                if (id === 'mockReviewerId') return Promise.resolve(mockReviewer);
                return Promise.resolve(null);
            });

            req.body = { employeeId: 'mockNonExistingEmployeeId', period: '2023-Q1', type: 'Performance', reviewerId: 'mockReviewerId' };

            await controller.createEvaluation(req as Request, res as Response);

            expect(EmployeeRepository.findById).toHaveBeenCalledWith('mockNonExistingEmployeeId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: Messages.EMPLOYEE_NOT_FOUND });
        });

        it('debería retornar 404 si el revisor no existe', async () => {
            const mockEmployee = { id: '672df51e647c5c73f659c477' };

            (EmployeeRepository.findById as jest.Mock).mockImplementation((id) => {
                if (id === 'mockEmployeeId') return Promise.resolve(mockEmployee);
                return Promise.resolve(null);
            });

            req.body = { employeeId: 'mockEmployeeId', period: '2023-Q1', type: 'Performance', reviewerId: 'mockNonExistingReviewerId' };

            await controller.createEvaluation(req as Request, res as Response);

            expect(EmployeeRepository.findById).toHaveBeenCalledWith('mockNonExistingReviewerId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: Messages.REVIEWER_NOT_FOUND });
        });
    });

    describe('getAllEvaluations', () => {
        it('debería devolver evaluaciones paginadas desde el caché si están disponibles', async () => {
            const mockCachedData = JSON.stringify({
                page: 1,
                limit: 10,
                totalPages: 1,
                totalEvaluations: 1,
                evaluations: [{ id: '1', employeeId: '123' }],
            });

            (redis.get as jest.Mock).mockResolvedValue(mockCachedData);

            req.query = { page: '1', limit: '10' };

            await controller.getAllEvaluations(req as Request, res as Response);

            expect(redis.get).toHaveBeenCalledWith('evaluations:1:10');
            expect(res.json).toHaveBeenCalledWith(JSON.parse(mockCachedData));
            expect(EvaluationRepository.findWithPagination).not.toHaveBeenCalled();
            expect(EvaluationRepository.countAll).not.toHaveBeenCalled();
        });

        it('debería devolver evaluaciones paginadas y almacenar en caché si no están en caché', async () => {
            const mockEvaluations = [{ id: '1', employeeId: '123' }];
            (EvaluationRepository.findWithPagination as jest.Mock).mockResolvedValue(mockEvaluations);
            (EvaluationRepository.countAll as jest.Mock).mockResolvedValue(1);

            (redis.get as jest.Mock).mockResolvedValue(null);
            const setSpy = jest.spyOn(redis, 'set').mockResolvedValue('OK');

            req.query = { page: '1', limit: '10' };

            await controller.getAllEvaluations(req as Request, res as Response);

            expect(redis.get).toHaveBeenCalledWith('evaluations:1:10');
            expect(EvaluationRepository.findWithPagination).toHaveBeenCalledWith(0, 10);
            expect(EvaluationRepository.countAll).toHaveBeenCalled();

            expect(res.json).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                totalPages: 1,
                totalEvaluations: 1,
                evaluations: mockEvaluations,
            });

            expect(setSpy).toHaveBeenCalledWith(
                'evaluations:1:10',
                JSON.stringify({
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    totalEvaluations: 1,
                    evaluations: mockEvaluations,
                }),
                'EX',
                300
            );

            setSpy.mockRestore();
        });
    });

    describe('updateEvaluation', () => {
        it('debería actualizar la evaluación si existe y limpiar el caché', async () => {
            const mockEvaluation = { id: '1', employeeId: '123', period: '2023-Q2' };
            (EvaluationRepository.updateById as jest.Mock).mockResolvedValue(mockEvaluation);

            const clearCacheSpy = jest.spyOn(RedisService, 'clearEvaluationListings').mockResolvedValue();

            req.params = { id: '1' };
            req.body = { period: '2023-Q2', type: 'Performance', status: 'completed' };

            await controller.updateEvaluation(req as Request, res as Response);

            expect(EvaluationRepository.updateById).toHaveBeenCalledWith('1', req.body);
            expect(res.json).toHaveBeenCalledWith({
                evaluation: mockEvaluation,
                message: Messages.EVALUATION_UPDATED_SUCCESS,
            });

            expect(clearCacheSpy).toHaveBeenCalled();

            clearCacheSpy.mockRestore();
        });

        it('debería devolver 404 si la evaluación no existe', async () => {
            (EvaluationRepository.updateById as jest.Mock).mockResolvedValue(null);

            req.params = { id: '1' };
            req.body = { period: '2023-Q2', type: 'Performance', status: 'completed' };

            await controller.updateEvaluation(req as Request, res as Response);

            expect(EvaluationRepository.updateById).toHaveBeenCalledWith('1', req.body);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: Messages.EVALUATION_NOT_FOUND });

            const clearCacheSpy = jest.spyOn(RedisService, 'clearEvaluationListings');
            expect(clearCacheSpy).not.toHaveBeenCalled();
        });
    });

    describe('submitEvaluation', () => {
        it('debería enviar una evaluación exitosamente y limpiar el caché', async () => {
            const mockEvaluation = {
                id: '1',
                employeeId: '123',
                status: 'pending',
                save: jest.fn().mockResolvedValue({})
            };

            (EvaluationRepository.findById as jest.Mock).mockResolvedValue(mockEvaluation);
            (QuestionRepository.findByIdAndEvaluationId as jest.Mock).mockResolvedValue({ _id: 'q1', evaluationId: '1' });
            (AnswerRepository.create as jest.Mock).mockResolvedValue({ _id: 'a1' });

            const clearCacheSpy = jest.spyOn(RedisService, 'clearEvaluationListings').mockResolvedValue();

            const req = {
                params: { id: '1' },
                body: {
                    answers: [
                        { questionId: 'q1', answerText: 'Answer 1' },
                        { questionId: 'q2', answerText: 'Answer 2' },
                    ],
                },
                user: { employeeId: '123' }
            } as Partial<Request> & { user: { employeeId: string } };

            const res = {
                status: jest.fn(() => res),
                json: jest.fn(),
            } as unknown as Response;

            await controller.submitEvaluation(req as Request, res as Response);

            expect(EvaluationRepository.findById).toHaveBeenCalledWith('1');
            expect(QuestionRepository.findByIdAndEvaluationId).toHaveBeenCalledWith('q1', '1');
            expect(AnswerRepository.create).toHaveBeenCalled();
            expect(mockEvaluation.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: Messages.EVALUATION_SUBMITTED_SUCCESS });

            expect(clearCacheSpy).toHaveBeenCalled();
            clearCacheSpy.mockRestore();
        });
    });

    describe('evaluateEvaluation', () => {
        it('debería evaluar una evaluación exitosamente', async () => {
            const mockEvaluation = { id: '1', employeeId: '123', status: 'in-progress', save: jest.fn() };
            const mockAnswer1 = { _id: 'a1', questionId: 'q1', score: 0, save: jest.fn().mockResolvedValue({}) };
            const mockAnswer2 = { _id: 'a2', questionId: 'q2', score: 0, save: jest.fn().mockResolvedValue({}) };

            (EvaluationRepository.findByIdWithPopulate as jest.Mock).mockResolvedValue(mockEvaluation);

            (AnswerRepository.findByQuestionId as jest.Mock).mockImplementation((questionId) => {
                if (questionId === 'q1') return Promise.resolve(mockAnswer1);
                if (questionId === 'q2') return Promise.resolve(mockAnswer2);
                return Promise.resolve(null);
            });

            req.params = { id: '1' };
            req.body = {
                answers: [
                    { questionId: 'q1', score: 5 },
                    { questionId: 'q2', score: 4 },
                ],
            };

            await controller.evaluateEvaluation(req as Request, res as Response);

            expect(EvaluationRepository.findByIdWithPopulate).toHaveBeenCalledWith('1');
            expect(mockAnswer1.save).toHaveBeenCalled();
            expect(mockAnswer2.save).toHaveBeenCalled();
            expect(mockEvaluation.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: Messages.EVALUATION_COMPLETED_SUCCESS,
                totalScore: 9
            });
        });
    });
});
