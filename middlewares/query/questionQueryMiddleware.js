const asyncErrorWrapper = require("express-async-handler");
const {
  searchHelper,
  populateHelper,
  questionSortHelper,
  paginationHelper,
} = require("./queryMiddlewareHelpers");

const questionQueryMiddleware = function (model, options) {
  return asyncErrorWrapper(async function (req, res, next) {
    // initial query
    let query = model.find();

    // Search
    query = searchHelper("title", query, req);

    // Population
    if (options && options.population) {
      // parametre olarak routerda options verilmişse
      query = populateHelper(query, options.population);
    }
    //Sort
    query = questionSortHelper(query, req);
    // Pagination
    const total = await model.countDocuments();

    const paginationResult = await paginationHelper(total, query, req);

    query = paginationResult.query;
    const pagination = paginationResult.pagination;
    const queryResult = await query; // query'i çalıştırdık şimdi.Yukarıda yardırdık.,routerda çalışması için
    //quert resultı bir yere koyman lazım .responsa koy.
    // bu res.queryResultı controllerda kullanacağız.

    res.queryResult = {
      success: true,
      count: queryResult.length,
      pagination: pagination,
      data: queryResult,
    };
    next();
  });
};

module.exports = questionQueryMiddleware;
