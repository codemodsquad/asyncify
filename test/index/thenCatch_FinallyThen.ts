export const input = `
function createUser(args) {
  const {username, organizationId} = args
  return Users.create({username})
    .then(user => {
      return addUserToOrganization(user, organizationId)
    })
    .catch(err => {
      console.error(err.stack)
      return failedUser()
    })
    .finally(() => {
      cleanup()
    })
}
`

export const options = {}

export const expected = `
function createUser(args) {
  const {username, organizationId} = args
  let returnValue
  try {
    const user = await Users.create({username})
    returnValue = await addUserToOrganization(user, organizationId)
  }
  catch (err) {
    console.error(err.stack)
    returnValue = await failedUser()
  }
  finally {
    await cleanup()
  }
  return returnValue
}
`
