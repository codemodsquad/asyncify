export const input = `
class Test {
  _validateAndRunHooks() {
    const runHooks = this.modelInstance.constructor.runHooks.bind(this.modelInstance.constructor);
    return runHooks('beforeValidate', this.modelInstance, this.options)
      .then(() =>
        this._validate()
          .catch(error => runHooks('validationFailed', this.modelInstance, this.options, error)
            .then(newError => { throw newError || error; }))
      )
      .then(() => runHooks('afterValidate', this.modelInstance, this.options)).then(() => this.modelInstance);
  }
} 
`

export const options = {}

export const expected = `
class Test {
  async _validateAndRunHooks() {
    const runHooks = this.modelInstance.constructor.runHooks.bind(this.modelInstance.constructor);
    await runHooks('beforeValidate', this.modelInstance, this.options)
    try {
      await this._validate()
    } catch (error) {
      const newError = await runHooks('validationFailed', this.modelInstance, this.options, error)
      throw newError || error
    }
    await runHooks('afterValidate', this.modelInstance, this.options)
    return this.modelInstance
  }
}
`
