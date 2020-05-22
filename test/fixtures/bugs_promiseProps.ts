export const input = `
it('should support ordering with only belongsTo includes', function() {
  const User = this.sequelize.define('User', {}),
    Item = this.sequelize.define('Item', { 'test': DataTypes.STRING }),
    Order = this.sequelize.define('Order', { 'position': DataTypes.INTEGER });

  User.belongsTo(Item, { 'as': 'itemA', foreignKey: 'itemA_id' });
  User.belongsTo(Item, { 'as': 'itemB', foreignKey: 'itemB_id' });
  User.belongsTo(Order);

  return this.sequelize.sync().then(() => {
    return promiseProps({
      users: User.bulkCreate([{}, {}, {}]).then(() => {
        return User.findAll();
      }),
      items: Item.bulkCreate([
        { 'test': 'abc' },
        { 'test': 'def' },
        { 'test': 'ghi' },
        { 'test': 'jkl' }
      ]).then(() => {
        return Item.findAll({ order: ['id'] });
      }),
      orders: Order.bulkCreate([
        { 'position': 2 },
        { 'position': 3 },
        { 'position': 1 }
      ]).then(() => {
        return Order.findAll({ order: ['id'] });
      })
    }).then(results => {
      const user1 = results.users[0];
      const user2 = results.users[1];
      const user3 = results.users[2];

      const item1 = results.items[0];
      const item2 = results.items[1];
      const item3 = results.items[2];
      const item4 = results.items[3];

      const order1 = results.orders[0];
      const order2 = results.orders[1];
      const order3 = results.orders[2];

      return Promise.all([
        user1.setItemA(item1),
        user1.setItemB(item2),
        user1.setOrder(order3),
        user2.setItemA(item3),
        user2.setItemB(item4),
        user2.setOrder(order2),
        user3.setItemA(item1),
        user3.setItemB(item4),
        user3.setOrder(order1)
      ]);
    }).then(() => {
      return User.findAll({
        'include': [
          { 'model': Item, 'as': 'itemA', where: { test: 'abc' } },
          { 'model': Item, 'as': 'itemB' },
          Order],
        'order': [
          [Order, 'position']
        ]
      }).then(as => {
        expect(as.length).to.eql(2);

        expect(as[0].itemA.test).to.eql('abc');
        expect(as[1].itemA.test).to.eql('abc');

        expect(as[0].Order.position).to.eql(1);
        expect(as[1].Order.position).to.eql(2);
      });
    });
  });
});
`

export const options = {}

export const expected = `
it('should support ordering with only belongsTo includes', async function() {
  const User = this.sequelize.define('User', {}),
    Item = this.sequelize.define('Item', { 'test': DataTypes.STRING }),
    Order = this.sequelize.define('Order', { 'position': DataTypes.INTEGER });

  User.belongsTo(Item, { 'as': 'itemA', foreignKey: 'itemA_id' });
  User.belongsTo(Item, { 'as': 'itemB', foreignKey: 'itemB_id' });
  User.belongsTo(Order);

  await this.sequelize.sync();

  const results = await promiseProps({
    users: User.bulkCreate([{}, {}, {}]).then(() => {
      return User.findAll()
    }),
    items: Item.bulkCreate([
      { 'test': 'abc' },
      { 'test': 'def' },
      { 'test': 'ghi' },
      { 'test': 'jkl' }
    ]).then(() => {
      return Item.findAll({ order: ['id'] })
    }),
    orders: Order.bulkCreate([
      { 'position': 2 },
      { 'position': 3 },
      { 'position': 1 }
    ]).then(() => {
      return Order.findAll({ order: ['id'] });
    })
  });

  const user1 = results.users[0];
  const user2 = results.users[1];
  const user3 = results.users[2];

  const item1 = results.items[0];
  const item2 = results.items[1];
  const item3 = results.items[2];
  const item4 = results.items[3];

  const order1 = results.orders[0];
  const order2 = results.orders[1];
  const order3 = results.orders[2];

  await Promise.all([
    user1.setItemA(item1),
    user1.setItemB(item2),
    user1.setOrder(order3),
    user2.setItemA(item3),
    user2.setItemB(item4),
    user2.setOrder(order2),
    user3.setItemA(item1),
    user3.setItemB(item4),
    user3.setOrder(order1)
  ]);

  const as = await User.findAll({
    'include': [
      { 'model': Item, 'as': 'itemA', where: { test: 'abc' } },
      { 'model': Item, 'as': 'itemB' },
      Order],
    'order': [
      [Order, 'position']
    ]
  });

  expect(as.length).to.eql(2);

  expect(as[0].itemA.test).to.eql('abc');
  expect(as[1].itemA.test).to.eql('abc');

  expect(as[0].Order.position).to.eql(1);
  expect(as[1].Order.position).to.eql(2);
});
`
