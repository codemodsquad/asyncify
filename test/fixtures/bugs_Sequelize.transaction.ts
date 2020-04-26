export const input = `
class Sequelize {
  transaction(options, autoCallback) {
    if (typeof options === 'function') {
      autoCallback = options;
      options = undefined;
    }

    const transaction = new Transaction(this, options);

    if (!autoCallback) return transaction.prepareEnvironment(false).then(() => transaction);

    // autoCallback provided
    return Sequelize._clsRun(() => {
      return transaction.prepareEnvironment()
        .then(() => autoCallback(transaction))
        .then(result => Promise.resolve(transaction.commit()).then(() => result))
        .catch(err => {
          // Rollback transaction if not already finished (commit, rollback, etc)
          // and reject with original error (ignore any error in rollback)
          return Promise.resolve().then(() => {
            if (!transaction.finished) return transaction.rollback().catch(() => {});
          }).then(() => { throw err; });
        });
    });
  }
}
`

export const options = {}

export const expected = `
class Sequelize {
  async transaction(options, autoCallback) {
    if (typeof options === 'function') {
      autoCallback = options;
      options = undefined;
    }

    const transaction = new Transaction(this, options);

    if (!autoCallback) {
      await transaction.prepareEnvironment(false)
      return transaction;
    }

    // autoCallback provided
    return Sequelize._clsRun(async () => {
      try {
        await transaction.prepareEnvironment();
        const result = await autoCallback(transaction);
        await transaction.commit();
        return result;
      } catch (err) {
        // Rollback transaction if not already finished (commit, rollback, etc)
        // and reject with original error (ignore any error in rollback)
        if (!transaction.finished) await transaction.rollback().catch(() => {});
        throw err;
      }
    });
  }
}
`
