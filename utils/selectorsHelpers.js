const elementSelector = async (selector, page, type, timeout, hidden = false) => {
  /* handling Xpath and css selectors is different. Since many functions require
  to make this distinction this function was created to do it */
  if (type === 'Xpath') {
    return await page.waitForXPath(selector, { timeout, hidden })
  } else {
    return await page.waitForSelector(selector, { timeout, hidden })
  }
}

export const clickElement = async function ({ selector, type = 'css' }, page) {
  const element = await elementSelector(selector, page, type, 60000)
  await element.click()
  return element
}

export const clickSomething = async function (selector, page, type = 'Xpath') {
  const element = await elementSelector(selector, page, type, 20000)
  await page.evaluate((x) => x.click(), element)
  return element
}

export const openDropdown = async function ({ selector, type = 'Xpath' }, page) {
  const element = await elementSelector(selector, page, type, 60000)
  await element.click()
  return element
}

export const clickAndType = async function ({ selector, type = 'Xpath' }, page, text = '') {
  if (type === 'Xpath') {
    const forTyping = await clickElement({ selector, type }, page)
    await forTyping.type(text)
  } else {
    await page.type(selector, text)
  }
}

export const clearInput = async function ({ selector, type = 'Xpath' }, page) {
  const field = await elementSelector(selector, page, type, 20000)
  await field.click({ clickCount: 3 })
  page.keyboard.press('Backspace')
}

export const assertElementPresent = async function ({ selector, type = 'Xpath' }, page) {
  const element = await elementSelector(selector, page, type, 90000)
  const expectHandler = expect(element)
  type !== 'Xpath' ? expectHandler.not.toBeNull() : expectHandler.toBeDefined() // for Css there is a different condition to make
  return element
}

export const assertElementNotPresent = async function ({ selector, type = 'Xpath' }, page) {
  const element = await elementSelector(selector, page, type, 3000, true)
  expect(element).toBeNull()
  return element
}

export const assertTextPresent = async function ({ selector, type = 'Xpath' }, textPresent, page) {
  const element = await assertElementPresent({ selector, type }, page)
  const elementText = await page.evaluate((x) => x.innerText, element)
  expect(elementText).toMatch(textPresent)
}

export const getInnerText = async function ({ selector, type = 'Xpath' }, page) {
  const element = await assertElementPresent({ selector, type }, page)
  let elementText = await page.evaluate((x) => x.innerText, element)
  if (elementText === '') {
    elementText = await page.evaluate((x) => x.value, element)
  }
  return elementText
}

export const getNumberInString = async function ({ selector, type = 'Xpath' }, page) {
  const text = await getInnerText({ selector, type }, page)
  const number = text.match(/\d+.?\d+|\d+/)[0]
  return parseFloat(number)
}

export const clickByText = async function (tag, text, page) {
  await page.$$eval(
    tag,
    (nodes, text) => {
      console.log('Found nodes: ', nodes)
      if (nodes.length > 0) {
        nodes.forEach((singleNode) => {
          if (singleNode.innerText.toLocaleLowerCase() === text.toLocaleLowerCase()) singleNode.click()
        })
      } else {
        console.log('No nodes found')
      }
    },
    text,
  )
}

export const isTextPresent = async function (selector, text, page) {
  await page.waitForFunction(
    (selector, text) => document.querySelector(selector).innerText.includes(text),
    { timeout: 60000 },
    selector,
    text,
  )
}
