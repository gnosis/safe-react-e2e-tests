const elementSelector = async (selector, page, type, timeout, hidden = false) => {
  // Handling Xpath and css selectors is different. Since many functions require
  // to make this distinction this function was created to do it
  if (type === 'Xpath') {
    return page.waitForXPath(selector, { timeout, hidden })
  } else {
    return page.waitForSelector(selector, { timeout, hidden })
  }
}

export const clickElement = async ({ selector, type = 'css' }, page) => {
  const element = await elementSelector(selector, page, type, 60000)
  await element.click()
  return element
}

export const clickSomething = async (selector, page, type = 'Xpath') => {
  const element = await elementSelector(selector, page, type, 20000)
  await page.evaluate((x) => x.click(), element)
  return element
}

export const openDropdown = async ({ selector, type = 'Xpath' }, page) => {
  const element = await elementSelector(selector, page, type, 60000)
  await element.click()
  return element
}

export const clickAndType = async ({ selector, type = 'Xpath' }, page, text = '') => {
  if (type === 'Xpath') {
    const forTyping = await clickElement({ selector, type }, page)
    await forTyping.type(text)
  } else {
    await page.type(selector, text)
  }
}

export const clearInput = async ({ selector, type = 'Xpath' }, page) => {
  const field = await elementSelector(selector, page, type, 20000)
  await field.click({ clickCount: 3 })
  page.keyboard.press('Backspace')
}

export const assertElementPresent = async ({ selector, type = 'Xpath' }, page) => {
  const element = await elementSelector(selector, page, type, 0)
  const expectHandler = expect(element)
  type !== 'Xpath' ? expectHandler.not.toBeNull() : expectHandler.toBeDefined() // for Css there is a different condition to make
  return element
}

export const assertElementNotPresent = async ({ selector, type = 'Xpath' }, page) => {
  const element = await elementSelector(selector, page, type, 0, true)
  expect(element).toBeNull()
  return element
}

export const assertTextPresent = async ({ selector, type = 'Xpath' }, textPresent, page) => {
  const element = await assertElementPresent({ selector, type }, page)
  const elementText = await page.evaluate((x) => x.innerText, element)
  expect(elementText).toMatch(textPresent)
}

export const getInnerText = async ({ selector, type = 'Xpath' }, page) => {
  const element = await assertElementPresent({ selector, type }, page)
  let elementText = await page.evaluate((x) => x.innerText, element)
  if (elementText === '') {
    elementText = await page.evaluate((x) => x.value, element)
  }
  return elementText
}

export const getNumberInString = async ({ selector, type = 'css' }, page) => {
  const text = await getInnerText({ selector, type }, page)
  const number = text.match(/\d+.?\d+|\d+/)[0]
  return parseFloat(number)
}

export const clickByText = async (tag, text, page) =>
  page.$$eval(
    tag,
    (nodes, text) => {
      console.log('Found nodes: ', nodes)
      if (nodes.length > 0) {
        nodes.forEach((singleNode) => {
          if (singleNode.innerText.toLocaleLowerCase() === text.toLocaleLowerCase()) {
            singleNode.click()
          }
        })
      } else {
        console.log('No nodes found')
      }
    },
    text,
  )

export const isTextPresent = async (selector, text, page) =>
  page.waitForFunction(
    (selector, text) => document.querySelector(selector)?.innerText.includes(text),
    { timeout: 60000 },
    selector,
    text,
  )

export const isSafeAppLoaded = async function (safeAddress, app, gnosisPage) {
  let appLoadResult

  try {
    const jsHandle = await Promise.race([
      gnosisPage.waitForFunction(
        async (safeAddress) => {
          const iframe = document.querySelector('iframe[id^="iframe-"]')
          const iframeDocument = iframe?.contentDocument

          // Check some common selectors
          if (iframeDocument?.body?.querySelector('#root,#app,.app,main,#__next,app-root')) {
            return { status: 'loaded', description: 'Selector found' }
          }

          return false
        },
        { polling: 500, timeout: 35000 },
        safeAddress,
      ),
      isTextPresent('body', 'Something went wrong, please try again', gnosisPage),
    ])

    // Unwrap JSHandle
    appLoadResult = await jsHandle.evaluate((value) => value)
  } catch (error) {
    gnosisPage.screenshot({ path: `./e2e-tests-assets/error-${app}.png` })
    console.log(error)
  }

  if (appLoadResult === true) {
    return { status: 'error', description: 'App take too long to load' }
  }

  return appLoadResult || { status: 'error', description: 'Unable to load iframe' }
}

export const getAllAppTitles = async function (selector, gnosisPage) {
  return await gnosisPage.evaluate(
    (selector) =>
      Array.from(document.querySelectorAll(selector)).map((element, index) => ({
        title: element.innerText,
        index,
      })),
    selector,
  )
}

export const scrollIntoApp = async function (gnosisPage, app) {
  await gnosisPage.evaluate((app) => {
    const xpath = `//h5[contains(text(),'${app}')]`
    const matchingElement = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue

    if (matchingElement) {
      matchingElement.scrollIntoView()
    }
  }, app)
}
