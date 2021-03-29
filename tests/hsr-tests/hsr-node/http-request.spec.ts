describe('server/http-request', () => {
  it('should handle stream', async () => {
    // const app = router()
    // const cli = nodeClient(app)
    // app.path('/api/todo').post(async (req) => {
    //   const data = await req.bodyAsString()
    //   expect(data).toEqual('foobar')
    //   return req.ok()
    // })
    // const res = await cli
    //   .path('/api/todo')
    //   .body(Readable.from(['foo', 'bar']))
    //   .post()
    // expect(res.statusCode).toEqual(200)
  })

  it('should handle buffer', async () => {
    // const app = router()
    // const cli = nodeClient(app)
    // app.path('/api/todo').post(async (req) => {
    //   const data = await req.bodyAsString()
    //   expect(data).toEqual('foo')
    //   return req.ok()
    // })
    // const res = await cli.path('/api/todo').body(Buffer.from('foo')).post()
    // expect(res.statusCode).toEqual(200)
  })
})
