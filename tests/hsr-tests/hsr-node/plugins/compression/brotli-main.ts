import { browserClient } from '../../../../../packages/hsr-browser/browser-client'

const client = browserClient();
(<any>window).result = client.get('/api/test')
