const asyncErrorWrapper = require("express-async-handler");
const {
  searchHelper,

  paginationHelper,
} = require("./queryMiddlewareHelpers");

const userQueryMiddleware = function (model, options) {
  return asyncErrorWrapper(async function (req, res, next) {
    // initial query
    let query = model.find();

    query = searchHelper("name", query, req);

    const total = await model.countDocuments();

    const paginationResult = await paginationHelper(total, query, req);

    query = paginationResult.query;
    const pagination = paginationResult.pagination;

    const queryResult = await query.find();
    res.queryResult = {
      success: true,
      count: queryResult.length,
      pagination: pagination,
      data: queryResult,
    };

    next();
  });
};

module.exports = { userQueryMiddleware };
