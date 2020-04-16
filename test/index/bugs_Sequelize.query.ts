export const input = `
class Sequelize {
  query(sql, options) {
    options = Object.assign({}, this.options.query, options);

    if (options.instance && !options.model) {
      options.model = options.instance.constructor;
    }

    if (!options.instance && !options.model) {
      options.raw = true;
    }

    // map raw fields to model attributes
    if (options.mapToModel) {
      options.fieldMap = _.get(options, 'model.fieldAttributeMap', {});
    }

    options = _.defaults(options, {
      // eslint-disable-next-line no-console
      logging: Object.prototype.hasOwnProperty.call(this.options, 'logging') ? this.options.logging : console.log,
      searchPath: Object.prototype.hasOwnProperty.call(this.options, 'searchPath') ? this.options.searchPath : 'DEFAULT'
    });

    if (!options.type) {
      if (options.model || options.nest || options.plain) {
        options.type = QueryTypes.SELECT;
      } else {
        options.type = QueryTypes.RAW;
      }
    }

    //if dialect doesn't support search_path or dialect option
    //to prepend searchPath is not true delete the searchPath option
    if (
      !this.dialect.supports.searchPath ||
      !this.options.dialectOptions ||
      !this.options.dialectOptions.prependSearchPath ||
      options.supportsSearchPath === false
    ) {
      delete options.searchPath;
    } else if (!options.searchPath) {
      //if user wants to always prepend searchPath (dialectOptions.preprendSearchPath = true)
      //then set to DEFAULT if none is provided
      options.searchPath = 'DEFAULT';
    }

    return Promise.resolve().then(() => {
      if (typeof sql === 'object') {
        if (sql.values !== undefined) {
          if (options.replacements !== undefined) {
            throw new Error('Both \`sql.values\` and \`options.replacements\` cannot be set at the same time');
          }
          options.replacements = sql.values;
        }

        if (sql.bind !== undefined) {
          if (options.bind !== undefined) {
            throw new Error('Both \`sql.bind\` and \`options.bind\` cannot be set at the same time');
          }
          options.bind = sql.bind;
        }

        if (sql.query !== undefined) {
          sql = sql.query;
        }
      }

      sql = sql.trim();

      if (options.replacements && options.bind) {
        throw new Error('Both \`replacements\` and \`bind\` cannot be set at the same time');
      }

      if (options.replacements) {
        if (Array.isArray(options.replacements)) {
          sql = Utils.format([sql].concat(options.replacements), this.options.dialect);
        } else {
          sql = Utils.formatNamedParameters(sql, options.replacements, this.options.dialect);
        }
      }

      let bindParameters;

      if (options.bind) {
        [sql, bindParameters] = this.dialect.Query.formatBindParameters(sql, options.bind, this.options.dialect);
      }

      const checkTransaction = () => {
        if (options.transaction && options.transaction.finished && !options.completesTransaction) {
          const error = new Error(\`\${options.transaction.finished} has been called on this transaction(\${options.transaction.id}), you can no longer use it. (The rejected query is attached as the 'sql' property of this error)\`);
          error.sql = sql;
          throw error;
        }
      };

      const retryOptions = Object.assign({}, this.options.retry, options.retry || {});

      return Promise.resolve(retry(() => Promise.resolve().then(() => {
        if (options.transaction === undefined && Sequelize._cls) {
          options.transaction = Sequelize._cls.get('transaction');
        }

        checkTransaction();

        return options.transaction
          ? options.transaction.connection
          : this.connectionManager.getConnection(options);
      }).then(connection => {
        const query = new this.dialect.Query(connection, this, options);
        return this.runHooks('beforeQuery', options, query)
          .then(() => checkTransaction())
          .then(() => query.run(sql, bindParameters))
          .finally(() => this.runHooks('afterQuery', options, query))
          .finally(() => {
            if (!options.transaction) {
              return this.connectionManager.releaseConnection(connection);
            }
          });
      }), retryOptions));
    });
  }
}
`

export const options = {}

export const expected = `
class Sequelize {
  async query(sql, options) {
    options = Object.assign({}, this.options.query, options);

    if (options.instance && !options.model) {
      options.model = options.instance.constructor;
    }

    if (!options.instance && !options.model) {
      options.raw = true;
    }

    // map raw fields to model attributes
    if (options.mapToModel) {
      options.fieldMap = _.get(options, 'model.fieldAttributeMap', {});
    }

    options = _.defaults(options, {
      // eslint-disable-next-line no-console
      logging: Object.prototype.hasOwnProperty.call(this.options, 'logging') ? this.options.logging : console.log,
      searchPath: Object.prototype.hasOwnProperty.call(this.options, 'searchPath') ? this.options.searchPath : 'DEFAULT'
    });

    if (!options.type) {
      if (options.model || options.nest || options.plain) {
        options.type = QueryTypes.SELECT;
      } else {
        options.type = QueryTypes.RAW;
      }
    }

    //if dialect doesn't support search_path or dialect option
    //to prepend searchPath is not true delete the searchPath option
    if (
      !this.dialect.supports.searchPath ||
      !this.options.dialectOptions ||
      !this.options.dialectOptions.prependSearchPath ||
      options.supportsSearchPath === false
    ) {
      delete options.searchPath;
    } else if (!options.searchPath) {
      //if user wants to always prepend searchPath (dialectOptions.preprendSearchPath = true)
      //then set to DEFAULT if none is provided
      options.searchPath = 'DEFAULT';
    }

    if (typeof sql === 'object') {
      if (sql.values !== undefined) {
        if (options.replacements !== undefined) {
          throw new Error('Both \`sql.values\` and \`options.replacements\` cannot be set at the same time');
        }
        options.replacements = sql.values;
      }

      if (sql.bind !== undefined) {
        if (options.bind !== undefined) {
          throw new Error('Both \`sql.bind\` and \`options.bind\` cannot be set at the same time');
        }
        options.bind = sql.bind;
      }

      if (sql.query !== undefined) {
        sql = sql.query;
      }
    }

    sql = sql.trim();

    if (options.replacements && options.bind) {
      throw new Error('Both \`replacements\` and \`bind\` cannot be set at the same time');
    }

    if (options.replacements) {
      if (Array.isArray(options.replacements)) {
        sql = Utils.format([sql].concat(options.replacements), this.options.dialect);
      } else {
        sql = Utils.formatNamedParameters(sql, options.replacements, this.options.dialect);
      }
    }

    let bindParameters;

    if (options.bind) {
      [sql, bindParameters] = this.dialect.Query.formatBindParameters(sql, options.bind, this.options.dialect);
    }

    const checkTransaction = () => {
      if (options.transaction && options.transaction.finished && !options.completesTransaction) {
        const error = new Error(\`\${options.transaction.finished} has been called on this transaction(\${options.transaction.id}), you can no longer use it. (The rejected query is attached as the 'sql' property of this error)\`);
        error.sql = sql;
        throw error;
      }
    };

    const retryOptions = Object.assign({}, this.options.retry, options.retry || {});

    return retry(async () => {
      if (options.transaction === undefined && Sequelize._cls) {
        options.transaction = Sequelize._cls.get('transaction');
      }

      checkTransaction();

      const connection = await (options.transaction
        ? options.transaction.connection
        : this.connectionManager.getConnection(options));
      const query = new this.dialect.Query(connection, this, options);
      try {
        await this.runHooks('beforeQuery', options, query)
        await checkTransaction()
        return await query.run(sql, bindParameters)
      } finally {
        await this.runHooks('afterQuery', options, query)
        if (!options.transaction) {
          await this.connectionManager.releaseConnection(connection);
        }
      }
    }, retryOptions);
  }
}
`
