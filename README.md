<h1 align="center">
  <img src="docs/logo.png" alt="hsr" width="250">
</h1>

<p align='center'>
  <img alt='build' src='https://img.shields.io/github/workflow/status/no0dles/hsr/build'>
  <img alt='license' src='https://img.shields.io/github/license/no0dles/hsr'>
</p>

## About

hsr stands for high-speed rail and should be faster, light and type friendly alternative to the famous express framework. hsr is written in typescript and uses the standard http / https module from the node ecosystem and fetch in the browser.

[Documentation](https://app.gitbook.com/@no0dles/s/hsr/)

# What does hsr different?
The hsr interface was designed to be very similar to express, but be more strict with types.

The goal of the project to create a http server/client that is expendable with plugins and middlewares without losing type safety.

Usually javascript libraries that take advantage of the plugin pattern, do not translate well into the typescript ecosystem and if there were loosely typed.

## Request route termination
The following example is a http server that accepts a GET request for the route /api/todo. It returns a 200 status code and json body with the a message object.
```typescript
const app = router()
app.path('api/todo').get(async (req, res) => {
  return res.statusCode(200).json({ message: 'hi' })
})
```
Every route in hsr gets the request and the response object as a function argument and requires the handling function to return the given response object back as a return value.
Because the route function requires always a return value, request always have an end. In express there is always the risk of not terminating the request processing, by either not calling next or do not end the response, because there was an unexpected error. In hsr this can not happen, since you will get a compilation error, if you do not return the response and therefore terminate the request. If a unexpected runtime error occurs in a route handler, hsr terminates automatically with a 500 status code if no middleware handles it.

## Request path arguments
The following example is a http server that accepts a GET request for the route /api/todo/:id where the id parameter can be of any string value. The response will be a json body with the passed id and fixed title value.
```typescript
const app = router()
app.path('api/todo').param('id').get(async (req, res, params) => {
  // params: { id: string }
  const id: string = params.id
  return res.statusCode(200).json({ id, title: 'foobar' })
})
```
Every route in hsr has a third function argument that contains all path parameters. The type gets constructed based on the param function calls and in this case is equal to { id: string }

## Request middlewares
The following example is a http server that use a hsr middleware for basic authentication. The middleware parses the Authorization header and extends the request object. The type of the request object changes as well with the use of the middleware and the auth property can be used in the route handler.
```typescript
const app = router()
app.use(basicAuthentication()).get((req, res) => {
  // req.auth: { username: string, password: string } | null
  const auth = req.auth;
  return res.statusCode(200);
})
```
In the previous example, the basic authentication header was optional. If the server always wants to enforce the header value to be set, the middleware options has a required flag. In cases where the value is missing, the middleware ends the request early on and returns an empty response with a 401 status code. The route handler request type has also changed the auth property type to be always required (not null).
```typescript
const app = router()
app.use(basicAuthentication({ required: true })).get((req, res) => {
  // req.auth: { username: string, password: string }
  const auth = req.auth;
  return res.statusCode(200);
})
```
