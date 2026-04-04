import ApiError from '../utils/ApiError.js';

const ALLOWED_RECORD_TYPES = ['income', 'expense'];

const parsePositiveAmount = (value) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new ApiError(400, 'Amount must be a number greater than 0');
  }

  return numberValue;
};

const normalizeRecordType = (type) => {
  if (typeof type !== 'string' || !ALLOWED_RECORD_TYPES.includes(type)) {
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

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(400, `${fieldName} must be a valid date`);
  }

  return parsedDate;
};

const parsePagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit
  };
};

const buildDateFilter = ({ startDate, endDate }) => {
  const parsedStartDate = parseOptionalDate(startDate, 'startDate');
  const parsedEndDate = parseOptionalDate(endDate, 'endDate');

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    throw new ApiError(400, 'startDate cannot be greater than endDate');
  }

  if (!parsedStartDate && !parsedEndDate) {
    return undefined;
  }

  const dateFilter = {};

  if (parsedStartDate) {
    dateFilter.$gte = parsedStartDate;
  }

  if (parsedEndDate) {
    dateFilter.$lte = parsedEndDate;
  }

  return dateFilter;
};

export {
  ALLOWED_RECORD_TYPES,
  parsePositiveAmount,
  normalizeRecordType,
  normalizeCategory,
  parseOptionalDate,
  parsePagination,
  buildDateFilter
};
