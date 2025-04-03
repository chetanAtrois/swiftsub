/**
 * Mongoose pagination plugin
 * @param {mongoose.Schema} schema - Mongoose schema to extend
 */
const paginate = (schema) => {
  schema.statics.paginate = async function (filter, options) {
    // 1. Sorting setup
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt'; // Default sort
    }

    // 2. Pagination configuration
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    // 3. Parallel execution: count + query
    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    // 4. Population handling
    if (options.populate) {
      let populateOptions;
      if (typeof options.populate === 'string') {
        populateOptions = options.populate.split(',');
      } else if (Array.isArray(options.populate)) {
        populateOptions = options.populate;
      } else {
        throw new Error('Invalid populate option');
      }

      populateOptions.forEach((populateOption) => {
        docsPromise = typeof populateOption === 'string' || typeof populateOption === 'object'
          ? docsPromise.populate(populateOption)
          : (() => { throw new Error('Invalid populate option') })();
      });
    }

    docsPromise = docsPromise.exec();

    // 5. Format paginated response
    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      
      return {
        results,
        page,
        limit,
        totalPages,
        totalResults
      };
    });
  };
};

module.exports = paginate;