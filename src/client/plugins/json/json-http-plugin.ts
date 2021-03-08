import { HttpClientPlugin } from '../../http-client-plugin'
import { JsonClient } from './json-client'
import { JsonHttpResponse } from './json-http-response'

export type JsonHttpPlugin = HttpClientPlugin<JsonClient, JsonHttpResponse>
