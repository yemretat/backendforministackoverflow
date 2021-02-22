const searchHelper = (searchKey, query, req) => {
  if (req.query.search) {
    const searchObject = {};
    const regex = new RegExp(req.query.search, "i");
    searchObject[searchKey] = regex; // burada title'ı regexli halini arıyoruz
    return query.where(searchObject);
  }
  return query; //search key yoksa başlangıç querysini return et
};
const populateHelper = (query, population) => {
  return query.populate(population);
};
const questionSortHelper = (query, req) => {
  const sortKey = req.query.sortBy;

  if (sortKey == "most-answered") {
    return query.sort("-answerCount  -createdAt"); //başa eksi koyduk yani büyükten küçüğe
  }
  if (sortKey == "most-liked") {
    return query.sort("-likeCount -createdAt"); // eğer likeCountları aynıysa en erken create olan
  } else {
    return query.sort("-createdAt");
  }
};
const paginationHelper = async (totalDocuments, query, req) => {
  //pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const startIndex = (page - 1) * limit;
  const enddIndex = page * limit;

  const pagination = {};
  const total = totalDocuments;
  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (enddIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }
  return {
    query:
      query === undefined ? undefined : query.skip(startIndex).limit(limit),
    pagination: pagination,
    startIndex, // bunu vermemizin nedeni bize questionlar içindeki answerlar lazım biz onların
    // bazılarını alacağız
    limit,
  };
};

module.exports = {
  searchHelper,
  populateHelper,
  questionSortHelper,
  paginationHelper,
};
