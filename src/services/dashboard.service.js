import mongoose from 'mongoose';

import FinancialRecord from '../models/FinancialRecord.js';
import ApiError from '../utils/ApiError.js';
import {
  buildDateFilter,
  normalizeRecordType
} from '../validators/record.validator.js';

const getValidatedUserId = (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, 'Unauthorized user context');
  }

  return userId;
};

const buildBaseMatch = ({ userId, startDate, endDate }) => {
  const match = {
    createdBy: getValidatedUserId(userId),
    isDeleted: false
  };

  const dateFilter = buildDateFilter({ startDate, endDate });

  if (dateFilter) {
    match.date = dateFilter;
  }

  return match;
};

const getSummary = async ({ userId, startDate, endDate }) => {
  const match = buildBaseMatch({ userId, startDate, endDate });

  const [summary] = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        },
        totalRecords: { $sum: 1 }
      }
    }
  ]);

  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    totalRecords: summary?.totalRecords || 0
  };
};

const getCategoryBreakdown = async ({ userId, startDate, endDate, type }) => {
  const match = buildBaseMatch({ userId, startDate, endDate });

  if (type !== undefined) {
    match.type = normalizeRecordType(type);
  }

  const categories = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalAmount: 1,
        count: 1
      }
    },
    { $sort: { totalAmount: -1, category: 1 } }
  ]);

  return categories;
};

export { getSummary, getCategoryBreakdown };
