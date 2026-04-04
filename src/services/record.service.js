import mongoose from 'mongoose';

import FinancialRecord from '../models/FinancialRecord.js';
import ApiError from '../utils/ApiError.js';
import {
  buildDateFilter,
  normalizeCategory,
  normalizeRecordType,
  parseOptionalDate,
  parsePagination,
  parsePositiveAmount
} from '../validators/record.validator.js';

const getValidatedUserId = (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, 'Unauthorized user context');
  }

  return userId;
};

const createRecord = async ({ amount, type, category, date, notes, userId }) => {
  const ownerId = getValidatedUserId(userId);

  const record = await FinancialRecord.create({
    amount: parsePositiveAmount(amount),
    type: normalizeRecordType(type),
    category: normalizeCategory(category),
    date: parseOptionalDate(date, 'Date') || new Date(),
    notes: typeof notes === 'string' ? notes.trim() : undefined,
    createdBy: ownerId
  });

  return record;
};

const getRecords = async ({ userId, type, category, startDate, endDate, page = 1, limit = 10 }) => {
  const ownerId = getValidatedUserId(userId);

  const pagination = parsePagination(page, limit);

  const query = {
    createdBy: ownerId,
    isDeleted: false
  };

  if (type !== undefined) {
    query.type = normalizeRecordType(type);
  }

  if (typeof category === 'string' && category.trim()) {
    query.category = category.trim();
  }

  const dateFilter = buildDateFilter({ startDate, endDate });

  if (dateFilter) {
    query.date = dateFilter;
  }

  const [records, total] = await Promise.all([
    FinancialRecord.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    FinancialRecord.countDocuments(query)
  ]);

  return {
    records,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(Math.ceil(total / pagination.limit), 1)
    }
  };
};

const updateRecord = async ({ recordId, userId, amount, type, category, date, notes }) => {
  const ownerId = getValidatedUserId(userId);

  if (!mongoose.isValidObjectId(recordId)) {
    throw new ApiError(400, 'Invalid record id');
  }

  const record = await FinancialRecord.findOne({
    _id: recordId,
    createdBy: ownerId,
    isDeleted: false
  });

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  if (amount !== undefined) {
    record.amount = parsePositiveAmount(amount);
  }

  if (type !== undefined) {
    record.type = normalizeRecordType(type);
  }

  if (category !== undefined) {
    record.category = normalizeCategory(category);
  }

  if (date !== undefined) {
    const parsedDate = parseOptionalDate(date, 'Date');

    if (!parsedDate) {
      throw new ApiError(400, 'Date must be a valid date');
    }

    record.date = parsedDate;
  }

  if (notes !== undefined) {
    if (notes !== null && typeof notes !== 'string') {
      throw new ApiError(400, 'Notes must be a string');
    }

    record.notes = typeof notes === 'string' ? notes.trim() : '';
  }

  await record.save();
  return record;
};

const deleteRecord = async ({ recordId, userId }) => {
  const ownerId = getValidatedUserId(userId);

  if (!mongoose.isValidObjectId(recordId)) {
    throw new ApiError(400, 'Invalid record id');
  }

  const record = await FinancialRecord.findOneAndUpdate(
    {
      _id: recordId,
      createdBy: ownerId,
      isDeleted: false
    },
    {
      isDeleted: true
    },
    {
      new: true
    }
  );

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  return record;
};

export { createRecord, getRecords, updateRecord, deleteRecord };
