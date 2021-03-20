import { browserClient } from '../../../hsr-browser/browser-client'

const client = browserClient()
// @ts-ignore
window.result = client.get('/api/test')
