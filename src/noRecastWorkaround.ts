import { API, FileInfo, Options } from 'jscodeshift'

module.exports = function(
  fileInfo: FileInfo,
  api: API,
  options: Options
): string | null | undefined | void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('./index')(fileInfo, api, {
    ...options,
    noRecastWorkaround: true,
  })
}
