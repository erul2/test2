function patternPrint(n) {
    let line = '';
    for (let i = 0; i <= n; i++) {
        for (j = 1; j <= i; j++) {
            line += " "
        }
        if (j % 2 == 0) {
            for (k = 1; k <= n - i; k++) {
                line += '+ '
            }
        } else {
            for (l = 1; l <= n - i; l++) {
                (l % 2 == 0) ? line += '+ ': line += '# '
            }
        }
        line += '\n'
    }
    console.log(line)
}

patternPrint(5)