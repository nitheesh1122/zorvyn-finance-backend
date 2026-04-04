import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createRecord as createRecordService,
  getRecords as getRecordsService,
  updateRecord as updateRecordService,
  deleteRecord as deleteRecordService
} from '../services/record.service.js';

const createRecord = asyncHandler(async (request, response) => {
  const result = await createRecordService({
    ...request.body,
    userId: request.user._id
  });

  response.status(201).json(new ApiResponse(201, result, 'Record created successfully'));
});

const getRecords = asyncHandler(async (request, response) => {
  const { type, category, startDate, endDate, page, limit } = request.query || {};

  const result = await getRecordsService({
    userId: request.user._id,
    type,
    category,
    startDate,
    endDate,
    page,
    limit
  });

  response.status(200).json(new ApiResponse(200, result, 'Records fetched successfully'));
});

const updateRecord = asyncHandler(async (request, response) => {
  const { id } = request.params;

  const result = await updateRecordService({
    recordId: id,
    userId: request.user._id,
    ...request.body
  });

  response.status(200).json(new ApiResponse(200, result, 'Record updated successfully'));
});

const deleteRecord = asyncHandler(async (request, response) => {
  const { id } = request.params;

  await deleteRecordService({
    recordId: id,
    userId: request.user._id
  });

  response.status(200).json(new ApiResponse(200, null, 'Record deleted successfully'));
});

export { createRecord, getRecords, updateRecord, deleteRecord };
