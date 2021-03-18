import { getServer } from '../../server'
import { httpApp } from './server'

const srv = getServer(httpApp).listen(0, async () => {
  console.log('http://localhost:' + (srv.address() as any).port)
})
