let initialCapital = 1000000000

const invest = [{
    instrument: 'Deposit',
    nominal: 350000000,
    profit: 3.5
}, {
    instrument: 'obligation',
    nominal: 195000000,
    profit: 13
}, {
    instrument: 'stockA',
    nominal: 227500000,
    profit: 14.5
}, {
    instrument: 'stockB',
    nominal: 227500000,
    profit: 12.5
}]



function total(d, y) {
    let init = initialCapital
    let totalProfit = 0
    for (i of d) {
        totalProfit += (i.profit / 100) * i.nominal * y
    }
    console.log(`Total money after ${y} year: ${init + totalProfit}`)
}

total(invest, 2)