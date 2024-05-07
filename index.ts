import { Plugin } from 'vite'
import path from 'path'

export default (): Plugin => ({
  name: 'dispatch',
  config: () => ({
    resolve: {
      alias: {
        '@dispatch': path.resolve('vendor/polarizetech/dispatch/resources/js')
      }
    }
  })
})
