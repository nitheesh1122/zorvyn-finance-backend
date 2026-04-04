import mongoose from 'mongoose';

import FinancialRecord from '../models/FinancialRecord.js';
import ApiError from '../utils/ApiError.js';

const allowedRecordTypes = ['income', 'expense'];

const parsePositiveNumber = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new ApiError(400, `${fieldName} must be a number greater than 0`);
  }

  return numberValue;
};

const normalizeType = (type) => {
  if (typeof type !== 'string' || !allowedRecordTypes.includes(type)) {
    throw new ApiError(400, 'Type must be either income or expense');
  }

  return type;
};

const normalizeCategory = (category) => {
  if (typeof category !== 'string' || !category.trim()) {
    throw new ApiError(400, 'Category is required');
  }

  return category.trim();
};

const parseOptionalDate = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${fieldName} must be a valid date`);
  }

  return date;
};

const getValidatedUserId = (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(401, 'Unauthorized user context');
  }

  return userId;
};

const createRecord = async ({ amount, type, category, date, notes, userId }) => {
  const ownerId = getValidatedUserId(userId);

  const record = await FinancialRecord.create({
    amount: parsePositiveNumber(amount, 'Amount'),
    type: normalizeType(type),
    category: normalizeCategory(category),
    date: parseOptionalDate(date, 'Date') || new Date(),
    notes: typeof notes === 'string' ? notes.trim() : undefined,
    createdBy: ownerId
  });

  return record;
};

const getRecords = async ({ userId, type, category, startDate, endDate, page = 1, limit = 10 }) => {
  const ownerId = getValidatedUserId(userId);

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const query = {
    createdBy: ownerId,
    isDeleted: false
  };

  if (type !== undefined) {
    query.type = normalizeType(type);
  }

  if (typeof category === 'string' && category.trim()) {
    query.category = category.trim();
  }

  const parsedStartDate = parseOptionalDate(startDate, 'startDate');
  const parsedEndDate = parseOptionalDate(endDate, 'endDate');

  if (parsedStartDate || parsedEndDate) {
    query.date = {};

    if (parsedStartDate) {
      query.date.$gte = parsedStartDate;
    }

    if (parsedEndDate) {
      query.date.$lte = parsedEndDate;
    }
  }

  const skip = (parsedPage - 1) * parsedLimit;

  const [records, total] = await Promise.all([
    FinancialRecord.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    FinancialRecord.countDocuments(query)
  ]);

  return {
    records,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.max(Math.ceil(total / parsedLimit), 1)
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
    record.amount = parsePositiveNumber(amount, 'Amount');
  }

  if (type !== undefined) {
    record.type = normalizeType(type);
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
