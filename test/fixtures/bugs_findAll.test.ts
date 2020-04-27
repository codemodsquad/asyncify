export const input = `
it('should support many levels of belongsTo', function() {
  const A = this.sequelize.define('a', {}),
    B = this.sequelize.define('b', {}),
    C = this.sequelize.define('c', {}),
    D = this.sequelize.define('d', {}),
    E = this.sequelize.define('e', {}),
    F = this.sequelize.define('f', {}),
    G = this.sequelize.define('g', {}),
    H = this.sequelize.define('h', {});

  A.belongsTo(B);
  B.belongsTo(C);
  C.belongsTo(D);
  D.belongsTo(E);
  E.belongsTo(F);
  F.belongsTo(G);
  G.belongsTo(H);

  return this.sequelize.sync({ force: true }).then(() => {
    return Promise.all([A.bulkCreate([
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {}
    ]).then(() => {
      return A.findAll();
    }), (function(singles) {
      let promise = Promise.resolve(),
        previousInstance,
        b;

      singles.forEach(model => {
        promise = promise.then(() => {
          return model.create({}).then(instance => {
            if (previousInstance) {
              return previousInstance[\`set\${_.upperFirst(model.name)}\`](instance).then(() => {
                previousInstance = instance;
              });
            }
            previousInstance = b = instance;
          });
        });
      });

      promise = promise.then(() => {
        return b;
      });

      return promise;
    })([B, C, D, E, F, G, H])]).then(([as, b]) => {
      return Promise.all(as.map(a => {
        return a.setB(b);
      }));
    }).then(() => {
      return A.findAll({
        include: [
          { model: B, include: [
            { model: C, include: [
              { model: D, include: [
                { model: E, include: [
                  { model: F, include: [
                    { model: G, include: [
                      { model: H }
                    ] }
                  ] }
                ] }
              ] }
            ] }
          ] }
        ]
      }).then(as => {
        expect(as.length).to.be.ok;

        as.forEach(a => {
          expect(a.b.c.d.e.f.g.h).to.be.ok;
        });
      });
    });
  });
});
`

export const options = {}

export const expected = `
it('should support many levels of belongsTo', async function() {
  const A = this.sequelize.define('a', {}),
    B = this.sequelize.define('b', {}),
    C = this.sequelize.define('c', {}),
    D = this.sequelize.define('d', {}),
    E = this.sequelize.define('e', {}),
    F = this.sequelize.define('f', {}),
    G = this.sequelize.define('g', {}),
    H = this.sequelize.define('h', {});

  A.belongsTo(B);
  B.belongsTo(C);
  C.belongsTo(D);
  D.belongsTo(E);
  E.belongsTo(F);
  F.belongsTo(G);
  G.belongsTo(H);

  await this.sequelize.sync({ force: true });

  await A.bulkCreate([
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {}
  ]);

  const [as0, b] = await Promise.all([await A.findAll(), (function(singles) {
    let promise = Promise.resolve(),
      previousInstance,
      b;

    singles.forEach(model => {
      promise = (async () => {
        await promise;
        const instance = await model.create({});
        if (previousInstance) {
          await previousInstance[\`set\${_.upperFirst(model.name)}\`](instance);
          previousInstance = instance;
          return
        }
        previousInstance = b = instance;
      })();
    });

    promise = promise.then(() => {
      return b;
    });

    return promise;
  })([B, C, D, E, F, G, H])]);

  await Promise.all(as0.map(a => {
    return a.setB(b);
  }));

  const as = await A.findAll({
    include: [
      { model: B, include: [
        { model: C, include: [
          { model: D, include: [
            { model: E, include: [
              { model: F, include: [
                { model: G, include: [
                  { model: H }
                ] }
              ] }
            ] }
          ] }
        ] }
      ] }
    ]
  });

  expect(as.length).to.be.ok;

  as.forEach(a => {
    expect(a.b.c.d.e.f.g.h).to.be.ok;
  });
});
`
