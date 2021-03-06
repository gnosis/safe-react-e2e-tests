// 3 ways to find an element with the tag "p" and click it

/*1 - */ 
await gnosisPage.evaluate(() => {
    document.querySelectorAll("p").forEach(element => { if(element.innerText === "Needs your confirmation") element.click()})
})

/*2 - */ 
await gnosisPage.$$eval('p', x => {
    x.forEach( xx => { if(xx.innerText === "Needs your confirmation") xx.click()})
})

/*3 - */ 
await gnosisPage.$$eval('p', selectorMatched => {
    for(i in selectorMatched)
        if(selectorMatched[i].textContent === 'Needs your confirmation'){
            selectorMatched[i].click();
            break;//Remove this line (break statement) if you want to click on all matched elements otherwise the first element only is clicked  
        }
    });

    //to click a certain element in the page with just the selector
    await gnosisPage.evaluate(() => {
        const firstTx = document.querySelectorAll('[data-testid="transaction-row"]')[0]
        firstTx && firstTx.click()
      })