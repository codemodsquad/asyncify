export const input = `
/**
 * Methods that runs all checks one by one and returns a result of checks
 * as an array of Requirement objects. This method intended to be used by cordova-lib check_reqs method
 *
 * @return Promise<Requirement[]> Array of requirements. Due to implementation, promise is always fulfilled.
 */
module.exports.check_all = function () {
    var requirements = [
        new Requirement('java', 'Java JDK'),
        new Requirement('androidSdk', 'Android SDK'),
        new Requirement('androidTarget', 'Android target'),
        new Requirement('gradle', 'Gradle')
    ];

    var checkFns = [
        this.check_java,
        this.check_android,
        this.check_android_target,
        this.check_gradle
    ];

    // Then execute requirement checks one-by-one
    return checkFns.reduce(function (promise, checkFn, idx) {
        // Update each requirement with results
        var requirement = requirements[idx];
        return promise.then(checkFn).then(function (version) {
            requirement.installed = true;
            requirement.metadata.version = version;
        }, function (err) {
            requirement.metadata.reason = err instanceof Error ? err.message : err;
        });
    }, Promise.resolve()).then(function () {
        // When chain is completed, return requirements array to upstream API
        return requirements;
    });
};
`

export const options = {}

export const expected = `
/**
 * Methods that runs all checks one by one and returns a result of checks
 * as an array of Requirement objects. This method intended to be used by cordova-lib check_reqs method
 *
 * @return Promise<Requirement[]> Array of requirements. Due to implementation, promise is always fulfilled.
 */
module.exports.check_all = async function() {
  var requirements = [
    new Requirement('java', 'Java JDK'),
    new Requirement('androidSdk', 'Android SDK'),
    new Requirement('androidTarget', 'Android target'),
    new Requirement('gradle', 'Gradle'),
  ]
  var checkFns = [
    this.check_java,
    this.check_android,
    this.check_android_target,
    this.check_gradle,
  ]
  await checkFns.reduce(async function(promise, checkFn, idx) {
    // Update each requirement with results
    var requirement = requirements[idx]
    try {
      const version = await promise.then(checkFn)
      requirement.installed = true
      requirement.metadata.version = version
    } catch (err) {
      requirement.metadata.reason = err instanceof Error ? err.message : err
    }
  }, Promise.resolve())
  // Then execute requirement checks one-by-one
  return requirements
}
`
