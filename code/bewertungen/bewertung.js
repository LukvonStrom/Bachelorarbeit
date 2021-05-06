const fs = require('fs');
const path = require('path')

const vergleiche = ['batch', 'echtzeit', 'multimode'].map(file => {
    return { name: file, content: JSON.parse(fs.readFileSync(path.join(__dirname, `${file}.json`)).toString()) }
});

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, `mapping.json`)).toString())

let max = {
    "Übertragbarkeit zwischen Clouds":1,
    "Integration mit AWS":3,
    "Generalisierung":4,
    "Erweiterbarkeit":4,
    "Fehlertransparenz":5,
    "geringer Wartungsaufwand":7,
    "Skalierbarkeit & serverlessness":7,
    "Kosten":7,
    "Performancegarantien":8,
    "Robustheit & Fehlertoleranz":9,
    "Auswertungen":11
}
// https://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
max.Summe = Object.values(max).reduce((accumulator, currentValue) => accumulator + currentValue);
    

for (let { name, content } of vergleiche) {

    const header = `\\begin{table}[H]
    \\centering
    \\begin{tabular}{|l|l!{\\vrule width 2pt}${content.map(i => `l|`).join('')}}
    \\hline`;
    const footer = `\\end{tabular}
\\caption{Bewertungsmatrix~${capitalizeFirstLetter(name)}}
\\label{tab:bewertungsmatrix-${name}}
\\end{table}`;

    const produkte = content;

    


    const final = produkte.map((produktObj) => {
        const sum = Object.values(produktObj.values).reduce((accumulator, currentValue) => accumulator + currentValue);
        produktObj.values.Summe = `\\cellcolor[HTML]{ECF4FF}${sum}`;
        return produktObj
    }).sort((a, b) => (a.values.Summe < b.values.Summe) ? 1 : ((b.values.Summe < a.values.Summe) ? -1 : 0));

    if(name !== "beispiel"){
        console.log(capitalizeFirstLetter(name))
    console.log(final.map(e => e.Produkt.replace(/\~/g, ' ')+ ":" + e.values.Summe.replace('\\cellcolor[HTML]{ECF4FF}', '')).join(', '))
    console.log()
    }
    

    let rows = [];
    let headerstr = [`\\multicolumn{1}{|c|}{Kriterium}`, `\\multicolumn{1}{c!{\\vrule width 2pt}}{\\begin{tabular}[c]{@{}c@{}}max.\\\\Punkte\\end{tabular}}`];
    for (let { Produkt } of final) {
        headerstr.push(`\\multicolumn{1}{c|}{\\begin{tabular}[c]{@{}c@{}}${Produkt.split('~').join('\\\\')}\\end{tabular}}`)
    }
    rows.push(headerstr.join(" & ") + ` \\\\ \\hline`)
    
    for (let index = 0; index < Object.keys(max).length; index++) {
        const key = Object.keys(max)[index];
        
        let beginning = [];
        beginning.push(mapping[key])
        beginning.push(max[key])
        for (let { Produkt, values } of final) {
            if (values[key] || typeof values[key] === 'number') {
                if(values[key] > max[key]){
                    throw new Error(key+ " of " + Produkt + " is exceeding max range")
                }
                if (key === "Summe") {
                beginning.push('\\textbf{'+values[key]+'}')
                }else{
                    beginning.push(values[key]) 
                }
            }
        }
        let string = beginning.join(" & ");
        if (key === "Summe") {
            rows.push('\\rowcolor[HTML]{ECF4FF}')
        }
        if(index === Object.keys(max).length -2){
            rows.push(string + ` \\\\ \\hlinewd{2pt}`)
        }else{
            rows.push(string + ` \\\\ \\hline`);
        }
    }

    let result = `${header}
${rows.join('\n     ')}
${footer}`

    fs.writeFileSync(path.join(__dirname, `../../content/04-produkte/vergleiche/${name}-vergleich.tex`), result)

}





