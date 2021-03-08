import { router } from '../../router'
import { staticPlugin } from './static'
import { nodeClient } from '../../node-client'
import { readFileSync } from 'fs'
import {join} from 'path'

describe('plugins/static', () => {
  const app = router()
  app.path('static').plugin(staticPlugin()).directory(join(__dirname,'assets'))
  const cli = nodeClient(app)

  const indexFile = readFileSync(join(__dirname,'assets', 'index.html')).toString()

  it('should serve static files', async () => {
    const res = await cli.path('static/index.html').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(indexFile)
  })

  it('should serve return 404 on non existing files', async () => {
    const res = await cli.path('static/index2.html').get()
    expect(res.statusCode).toEqual(404)
  })

  it('should serve index on directory', async () => {
    const res = await cli.path('static').get()
    expect(res.statusCode).toEqual(200)
    expect(await res.bodyAsString()).toEqual(indexFile)
  })
})
