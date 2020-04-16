export const input = `
class ConnectionManager {
  connect(config) {
    config.user = config.username;
    const connectionConfig = _.pick(config, [
      'user', 'password', 'host', 'database', 'port'
    ]);

    connectionConfig.types = {
      getTypeParser: ConnectionManager.prototype.getTypeParser.bind(this)
    };

    if (config.dialectOptions) {
      _.merge(connectionConfig,
        _.pick(config.dialectOptions, [
          'application_name',
          'ssl',
          'client_encoding',
          'binary',
          'keepAlive',
          'statement_timeout',
          'idle_in_transaction_session_timeout'
        ]));
    }

    return new Promise((resolve, reject) => {
      let responded = false;

      const connection = new this.lib.Client(connectionConfig);

      const parameterHandler = message => {
        switch (message.parameterName) {
          case 'server_version':
            if (this.sequelize.options.databaseVersion === 0) {
              const version = semver.coerce(message.parameterValue).version;
              this.sequelize.options.databaseVersion = semver.valid(version)
                ? version
                : this.defaultVersion;
            }
            break;
          case 'standard_conforming_strings':
            connection['standard_conforming_strings'] = message.parameterValue;
            break;
        }
      };

      const endHandler = () => {
        debug('connection timeout');
        if (!responded) {
          reject(new sequelizeErrors.ConnectionTimedOutError(new Error('Connection timed out')));
        }
      };

      // If we didn't ever hear from the client.connect() callback the connection timeout
      // node-postgres does not treat this as an error since no active query was ever emitted
      connection.once('end', endHandler);

      if (!this.sequelize.config.native) {
        // Receive various server parameters for further configuration
        connection.connection.on('parameterStatus', parameterHandler);
      }

      connection.connect(err => {
        responded = true;

        if (!this.sequelize.config.native) {
          // remove parameter handler
          connection.connection.removeListener('parameterStatus', parameterHandler);
        }

        if (err) {
          if (err.code) {
            switch (err.code) {
              case 'ECONNREFUSED':
                reject(new sequelizeErrors.ConnectionRefusedError(err));
                break;
              case 'ENOTFOUND':
                reject(new sequelizeErrors.HostNotFoundError(err));
                break;
              case 'EHOSTUNREACH':
                reject(new sequelizeErrors.HostNotReachableError(err));
                break;
              case 'EINVAL':
                reject(new sequelizeErrors.InvalidConnectionError(err));
                break;
              default:
                reject(new sequelizeErrors.ConnectionError(err));
                break;
            }
          } else {
            reject(new sequelizeErrors.ConnectionError(err));
          }
        } else {
          debug('connection acquired');
          connection.removeListener('end', endHandler);
          resolve(connection);
        }
      });
    }).then(connection => {
      let query = '';

      if (this.sequelize.options.standardConformingStrings !== false && connection['standard_conforming_strings'] !== 'on') {
        // Disable escape characters in strings
        // see https://github.com/sequelize/sequelize/issues/3545 (security issue)
        // see https://www.postgresql.org/docs/current/static/runtime-config-compatible.html#GUC-STANDARD-CONFORMING-STRINGS
        query += 'SET standard_conforming_strings=on;';
      }

      if (this.sequelize.options.clientMinMessages !== false) {
        query += \`SET client_min_messages TO \${this.sequelize.options.clientMinMessages};\`;
      }

      if (!this.sequelize.config.keepDefaultTimezone) {
        const isZone = !!moment.tz.zone(this.sequelize.options.timezone);
        if (isZone) {
          query += \`SET TIME ZONE '\${this.sequelize.options.timezone}';\`;
        } else {
          query += \`SET TIME ZONE INTERVAL '\${this.sequelize.options.timezone}' HOUR TO MINUTE;\`;
        }
      }

      if (query) {
        return Promise.resolve(connection.query(query)).then(() => connection);
      }
      return connection;
    }).then(connection => {
      if (Object.keys(this.nameOidMap).length === 0 &&
        this.enumOids.oids.length === 0 &&
        this.enumOids.arrayOids.length === 0) {
        return Promise.resolve(this._refreshDynamicOIDs(connection)).then(() => connection);
      }
      return connection;
    }).then(connection => {
      // Don't let a Postgres restart (or error) to take down the whole app
      connection.on('error', error => {
        connection._invalid = true;
        debug(\`connection error \${error.code || error.message}\`);
        this.pool.destroy(connection);
      });
      return connection;
    });
  }
}
`

export const options = {}

export const expected = `
class ConnectionManager {
  async connect(config) {
    config.user = config.username;
    const connectionConfig = _.pick(config, [
      'user', 'password', 'host', 'database', 'port'
    ]);

    connectionConfig.types = {
      getTypeParser: ConnectionManager.prototype.getTypeParser.bind(this)
    };

    if (config.dialectOptions) {
      _.merge(connectionConfig,
        _.pick(config.dialectOptions, [
          'application_name',
          'ssl',
          'client_encoding',
          'binary',
          'keepAlive',
          'statement_timeout',
          'idle_in_transaction_session_timeout'
        ]));
    }

    let connection
    let connection0
    const connection1 = await new Promise((resolve, reject) => {
      let responded = false;

      const connection = new this.lib.Client(connectionConfig);

      const parameterHandler = message => {
        switch (message.parameterName) {
          case 'server_version':
            if (this.sequelize.options.databaseVersion === 0) {
              const version = semver.coerce(message.parameterValue).version;
              this.sequelize.options.databaseVersion = semver.valid(version)
                ? version
                : this.defaultVersion;
            }
            break;
          case 'standard_conforming_strings':
            connection['standard_conforming_strings'] = message.parameterValue;
            break;
        }
      };

      const endHandler = () => {
        debug('connection timeout');
        if (!responded) {
          reject(new sequelizeErrors.ConnectionTimedOutError(new Error('Connection timed out')));
        }
      };

      // If we didn't ever hear from the client.connect() callback the connection timeout
      // node-postgres does not treat this as an error since no active query was ever emitted
      connection.once('end', endHandler);

      if (!this.sequelize.config.native) {
        // Receive various server parameters for further configuration
        connection.connection.on('parameterStatus', parameterHandler);
      }

      connection.connect(err => {
        responded = true;

        if (!this.sequelize.config.native) {
          // remove parameter handler
          connection.connection.removeListener('parameterStatus', parameterHandler);
        }

        if (err) {
          if (err.code) {
            switch (err.code) {
              case 'ECONNREFUSED':
                reject(new sequelizeErrors.ConnectionRefusedError(err));
                break;
              case 'ENOTFOUND':
                reject(new sequelizeErrors.HostNotFoundError(err));
                break;
              case 'EHOSTUNREACH':
                reject(new sequelizeErrors.HostNotReachableError(err));
                break;
              case 'EINVAL':
                reject(new sequelizeErrors.InvalidConnectionError(err));
                break;
              default:
                reject(new sequelizeErrors.ConnectionError(err));
                break;
            }
          } else {
            reject(new sequelizeErrors.ConnectionError(err));
          }
        } else {
          debug('connection acquired');
          connection.removeListener('end', endHandler);
          resolve(connection);
        }
      });
    });

    let query = '';

    if (this.sequelize.options.standardConformingStrings !== false && connection1['standard_conforming_strings'] !== 'on') {
      // Disable escape characters in strings
      // see https://github.com/sequelize/sequelize/issues/3545 (security issue)
      // see https://www.postgresql.org/docs/current/static/runtime-config-compatible.html#GUC-STANDARD-CONFORMING-STRINGS
      query += 'SET standard_conforming_strings=on;';
    }

    if (this.sequelize.options.clientMinMessages !== false) {
      query += \`SET client_min_messages TO \${this.sequelize.options.clientMinMessages};\`;
    }

    if (!this.sequelize.config.keepDefaultTimezone) {
      const isZone = !!moment.tz.zone(this.sequelize.options.timezone);
      if (isZone) {
        query += \`SET TIME ZONE '\${this.sequelize.options.timezone}';\`;
      } else {
        query += \`SET TIME ZONE INTERVAL '\${this.sequelize.options.timezone}' HOUR TO MINUTE;\`;
      }
    }

    if (query) {
      await connection1.query(query);
      connection0 = await connection1;
    } else {
      connection0 = await connection1;
    }
    if (Object.keys(this.nameOidMap).length === 0 &&
      this.enumOids.oids.length === 0 &&
      this.enumOids.arrayOids.length === 0) {
      await this._refreshDynamicOIDs(connection0);
      connection = await connection0;
    } else {
      connection = await connection0;
    }
    // Don't let a Postgres restart (or error) to take down the whole app
    connection.on('error', error => {
      connection._invalid = true;
      debug(\`connection error \${error.code || error.message}\`);
      this.pool.destroy(connection);
    });
    return connection;
  }
}
`
