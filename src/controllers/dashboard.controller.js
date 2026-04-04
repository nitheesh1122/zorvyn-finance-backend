import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getSummary as getSummaryService,
  getCategoryBreakdown as getCategoryBreakdownService
} from '../services/dashboard.service.js';

const getSummary = asyncHandler(async (request, response) => {
  const { startDate, endDate } = request.query || {};

  const summary = await getSummaryService({
    userId: request.user._id,
    startDate,
    endDate
  });

  response.status(200).json(new ApiResponse(200, summary, 'Dashboard summary fetched successfully'));
});

const getCategoryBreakdown = asyncHandler(async (request, response) => {
  const { startDate, endDate, type } = request.query || {};

  const categories = await getCategoryBreakdownService({
    userId: request.user._id,
    startDate,
    endDate,
    type
  });

  response.status(200).json(new ApiResponse(200, categories, 'Category breakdown fetched successfully'));
});

export { getSummary, getCategoryBreakdown };
