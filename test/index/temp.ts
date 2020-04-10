export const input = `
class Model {
  /**
   * Find a row that matches the query, or build and save the row if none is found
   * The successful result of the promise will be (instance, created)
   *
   * If no transaction is passed in the \`options\` object, a new transaction will be created internally, to prevent the race condition where a matching row is created by another connection after the find but before the insert call.
   * However, it is not always possible to handle this case in SQLite, specifically if one transaction inserts and another tries to select before the first one has committed. In this case, an instance of sequelize. TimeoutError will be thrown instead.
   * If a transaction is created, a savepoint will be created instead, and any unique constraint violation will be handled internally.
   *
   * @see
   * {@link Model.findAll} for a full specification of find and options
   *
   * @param {object}      options find and create options
   * @param {object}      options.where where A hash of search attributes. If \`where\` is a plain object it will be appended with defaults to build a new instance.
   * @param {object}      [options.defaults] Default values to use if creating a new instance
   * @param {Transaction} [options.transaction] Transaction to run query under
   *
   * @returns {Promise<Model,boolean>}
   */
  static findOrCreate(options) {
    if (!options || !options.where || arguments.length > 1) {
      throw new Error(
        'Missing where attribute in the options parameter passed to findOrCreate. ' +
        'Please note that the API has changed, and is now options only (an object with where, defaults keys, transaction etc.)'
      );
    }

    options = Object.assign({}, options);

    if (options.defaults) {
      const defaults = Object.keys(options.defaults);
      const unknownDefaults = defaults.filter(name => !this.rawAttributes[name]);

      if (unknownDefaults.length) {
        logger.warn(\`Unknown attributes (\${unknownDefaults}) passed to defaults option of findOrCreate\`);
      }
    }

    if (options.transaction === undefined && this.sequelize.constructor._cls) {
      const t = this.sequelize.constructor._cls.get('transaction');
      if (t) {
        options.transaction = t;
      }
    }

    const internalTransaction = !options.transaction;
    let values;
    let transaction;

    // Create a transaction or a savepoint, depending on whether a transaction was passed in
    return this.sequelize.transaction(options).then(t => {
      transaction = t;
      options.transaction = t;

      return this.findOne(Utils.defaults({ transaction }, options));
    }).then(instance => {
      if (instance !== null) {
        return [instance, false];
      }

      values = _.clone(options.defaults) || {};
      if (_.isPlainObject(options.where)) {
        values = Utils.defaults(values, options.where);
      }

      options.exception = true;
      options.returning = true;

      return this.create(values, options).then(instance => {
        if (instance.get(this.primaryKeyAttribute, { raw: true }) === null) {
          // If the query returned an empty result for the primary key, we know that this was actually a unique constraint violation
          throw new sequelizeErrors.UniqueConstraintError();
        }

        return [instance, true];
      }).catch(err => {
        if (!(err instanceof sequelizeErrors.UniqueConstraintError)) throw err;
        const flattenedWhere = Utils.flattenObjectDeep(options.where);
        const flattenedWhereKeys = Object.keys(flattenedWhere).map(name => _.last(name.split('.')));
        const whereFields = flattenedWhereKeys.map(name => _.get(this.rawAttributes, \`\${name}.field\`, name));
        const defaultFields = options.defaults && Object.keys(options.defaults)
          .filter(name => this.rawAttributes[name])
          .map(name => this.rawAttributes[name].field || name);

        const errFieldKeys = Object.keys(err.fields);
        const errFieldsWhereIntersects = Utils.intersects(errFieldKeys, whereFields);
        if (defaultFields && !errFieldsWhereIntersects && Utils.intersects(errFieldKeys, defaultFields)) {
          throw err;
        }

        if (errFieldsWhereIntersects) {
          _.each(err.fields, (value, key) => {
            const name = this.fieldRawAttributesMap[key].fieldName;
            if (value.toString() !== options.where[name].toString()) {
              throw new Error(\`\${this.name}#findOrCreate: value used for \${name} was not equal for both the find and the create calls, '\${options.where[name]}' vs '\${value}'\`);
            }
          });
        }

        // Someone must have created a matching instance inside the same transaction since we last did a find. Let's find it!
        return this.findOne(Utils.defaults({
          transaction: internalTransaction ? null : transaction
        }, options)).then(instance => {
          // Sanity check, ideally we caught this at the defaultFeilds/err.fields check
          // But if we didn't and instance is null, we will throw
          if (instance === null) throw err;
          return [instance, false];
        });
      });
    }).finally(() => {
      if (internalTransaction && transaction) {
        // If we created a transaction internally (and not just a savepoint), we should clean it up
        return transaction.commit();
      }
    });
  }
}
`

export const options = {}

export const expected = `
`
