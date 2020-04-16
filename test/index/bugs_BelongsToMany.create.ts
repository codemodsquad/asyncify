export const input = `
class BelongsToMany {
  create(sourceInstance, values, options) {
    const association = this;

    options = options || {};
    values = values || {};

    if (Array.isArray(options)) {
      options = {
        fields: options
      };
    }

    if (association.scope) {
      Object.assign(values, association.scope);
      if (options.fields) {
        options.fields = options.fields.concat(Object.keys(association.scope));
      }
    }

    // Create the related model instance
    return association.target.create(values, options).then(newAssociatedObject =>
      sourceInstance[association.accessors.add](newAssociatedObject, _.omit(options, ['fields'])).then(() => newAssociatedObject)
    );
  }
}
`

export const options = {}

export const expected = `
class BelongsToMany {
  async create(sourceInstance, values, options) {
    const association = this;

    options = options || {};
    values = values || {};

    if (Array.isArray(options)) {
      options = {
        fields: options
      };
    }

    if (association.scope) {
      Object.assign(values, association.scope);
      if (options.fields) {
        options.fields = options.fields.concat(Object.keys(association.scope));
      }
    }

    const newAssociatedObject = await association.target.create(values, options);
    await sourceInstance[association.accessors.add](newAssociatedObject, _.omit(options, ['fields']));
    // Create the related model instance
    return newAssociatedObject;
  }
}
`
