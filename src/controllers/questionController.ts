import { Request, Response } from 'express';
import { repository as QuestionRepository } from '@repositories/questionRepository';
import { repository as EvaluationRepository } from '@repositories/evaluationRepository';
import { service as RedisService } from '@config/redis';
import { Messages } from '@utils/messages';

export class QuestionController {

  public async createQuestions(req: Request, res: Response): Promise<Response> {
    try {
      const { evaluationId, questions } = req.body;

      const existingEvaluation = await EvaluationRepository.findById(evaluationId);
      if (!existingEvaluation) {
        return res.status(404).json({ message: Messages.EVALUATION_NOT_FOUND });
      }

      const createdQuestions = await Promise.all(
        questions.map(async (questionContent: string) => {
          return await QuestionRepository.create({ evaluationId, content: questionContent });
        })
      );

      const questionIds = createdQuestions.map(question => question._id);
      await EvaluationRepository.addQuestionsToEvaluation(evaluationId, questionIds);
      await RedisService.clearEvaluationListings();
      return res.status(201).json({ questions: createdQuestions, message: Messages.QUESTIONS_CREATED_SUCCESS });
    } catch (error) {
      throw error;
    }
  }

  public async getAllQuestions(req: Request, res: Response): Promise<Response> {
    try {

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      const questions = await QuestionRepository.findWithPagination(skip, limit);
      const totalQuestions = await QuestionRepository.countAll();
      const totalPages = Math.ceil(totalQuestions / limit);

      return res.json({
        page,
        limit,
        totalPages,
        totalQuestions,
        questions,
      });
    } catch (error) {
      throw error;
    }
  }

  public async updateQuestion(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const question = await QuestionRepository.updateById(id, { content });
      if (!question) {
        return res.status(404).json({ message: Messages.QUESTION_NOT_FOUND });
      }
      return res.json({ question, message: Messages.QUESTION_UPDATED_SUCCESS });
    } catch (error) {
      throw error;
    }
  }
}

export const controller = new QuestionController();
