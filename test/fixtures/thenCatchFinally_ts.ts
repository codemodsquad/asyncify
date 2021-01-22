export const input = `
function createUser(args) {
  const {username, organizationId} = args
  return Users.create({username})
    .then((user: User) => {
      return addUserToOrganization(user, organizationId)
    })
    .catch((err: Error) => {
      console.error(err.stack)
      return failedUser()
    })
    .finally(() => {
      return cleanup()
    })
}
`

export const options = {}
export const parser = 'ts'

export const expected = `
async function createUser(args) {
  const {username, organizationId} = args
  try {
    const user: User = await Users.create({ username })
    return await addUserToOrganization(user, organizationId)
  }
  catch (err) {
    console.error(err.stack)
    return failedUser()
  }
  finally {
    await cleanup()
  }
}
`
