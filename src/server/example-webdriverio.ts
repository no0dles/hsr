// describe('My Login application', () => {
//   it('should login with valid credentials', async () => {
//     const { remote } = require('webdriverio')
//     const browser = await remote({
//       capabilities: {
//         browserName: 'chrome',
//       },
//     })
//
//     await new Promise<void>((resolve) => {
//       server.listen(3000, async () => {
//         await browser.url('http://localhost:3000')
//         resolve()
//       })
//     })
//     await browser.deleteSession()
//
//     // await LoginPage.open()
//     //
//     // await LoginPage.login('tomsmith', 'SuperSecretPassword!')
//     // await expect(SecurePage.flashAlert).toBeExisting()
//     // await expect(SecurePage.flashAlert).toHaveTextContaining('You logged into a secure area!')
//   })
// })
