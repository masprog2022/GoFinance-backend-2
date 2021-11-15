import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';
// import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    // verificar se a categoria ja existe
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let transactioCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactioCategory) {
      // Nao existe ? cria ela
      transactioCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactioCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactioCategory,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
