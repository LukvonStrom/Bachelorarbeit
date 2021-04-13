/* let code = `
\begin{table}[H]
\centering
\begin{tabular}{|l|l|l|}
\hline
\multicolumn{1}{|c|}{Kriterium} & \multicolumn{1}{c|}{Priorität} & \multicolumn{1}{c|}{Punkte} \\ \hline
Auswertungen nach \autoref{chap:auswertungsarten} & 11 & \cellcolor[HTML]{ECF4FF}\arg[1] \\ \hline
Performancegarantien & 10 & \cellcolor[HTML]{ECF4FF}\arg[2] \\ \hline
Robustheit \& Fehlertoleranz & 9 & \cellcolor[HTML]{ECF4FF}\arg[3] \\ \hline
Skalierbarkeit \& \enquote{serverlessness} & 8 & \cellcolor[HTML]{ECF4FF}\arg[4] \\ \hline
Kosten & 7 & \cellcolor[HTML]{ECF4FF}\arg[5] \\ \hline
geringer Wartungsaufwand & 6 & \cellcolor[HTML]{ECF4FF}\arg[6] \\ \hline
Fehlertransparenz & 5 & \cellcolor[HTML]{ECF4FF}\arg[7] \\ \hline
Erweiterbarkeit & 4 & \cellcolor[HTML]{ECF4FF}\arg[8] \\ \hline
Generalisierung & 3 & \cellcolor[HTML]{ECF4FF}\arg[9] \\ \hline
Integration mit anderen \ac{AWS} Diensleistungen & 2 & \cellcolor[HTML]{ECF4FF}\arg[10] \\ \hline
Übertragbarkeit zwischen Clouds (ISO 9126) & 1 & \cellcolor[HTML]{ECF4FF}\arg[11] \\ \hline
\rowcolor[HTML]{ECF4FF} 
\multicolumn{1}{|c|}{\cellcolor[HTML]{ECF4FF}Summe} & 66 & \arg[12] \\ \hline
\end{tabular}
\caption{Bewertungsmatrix #1}
\label{tab:bewertungsmatrix-#1}
\end{table}
` */

const fs = require('fs');
const path = require('path')

const vergleiche = ['batch', 'echtzeit', 'multimode', 'beispiel'].map(file => {
    return { name: file, content: JSON.parse(fs.readFileSync(path.join(__dirname, `${file}.json`)).toString()) }
});

const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, `mapping.json`)).toString())

const max = {
    "Auswertungen":11,
    "Performancegarantien":10,
    "Robustheit & Fehlertoleranz":9,
    "Skalierbarkeit & serverlessness":8,
    "Kosten":7,
    "geringer Wartungsaufwand":6,
    "Fehlertransparenz":5,
    "Erweiterbarkeit":4,
    "Generalisierung":3,
    "Integration mit AWS":2,
    "Übertragbarkeit zwischen Clouds":1,
    "Summe": 66
}
// https://stackoverflow.com/a/1026087
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

    let keys = new Set();

    const final = produkte.map((produktObj) => {
        const sum = Object.values(produktObj.values).reduce((accumulator, currentValue) => accumulator + currentValue);
        produktObj.values.Summe = `\\cellcolor[HTML]{ECF4FF}${sum}`;
        return produktObj
    }).sort((a, b) => (a.values.Summe < b.values.Summe) ? 1 : ((b.values.Summe < a.values.Summe) ? -1 : 0));
    final.forEach(produktObj => {
        Object.keys(produktObj.values).forEach(el => keys.add(el))
        keys.add("Summe");
    });

    let rows = [];
    let headerstr = [`\\multicolumn{1}{|c|}{Kriterium}`, `\\multicolumn{1}{c!{\\vrule width 2pt}}{\\begin{tabular}[c]{@{}c@{}}max.\\\\Punkte\\end{tabular}}`];
    for (let { Produkt } of final) {
        headerstr.push(`\\multicolumn{1}{c|}{\\begin{tabular}[c]{@{}c@{}}${Produkt.split('~').join('\\\\')}\\end{tabular}}`)
    }
    rows.push(headerstr.join(" & ") + ` \\\\ \\hline`)

    let keysArray = [...keys]
    for (let key of keysArray) {
        let beginning = [];
        beginning.push(mapping[key])
        beginning.push(max[key])
        for (let { values } of final) {
            if (values[key] || typeof values[key] === 'number') {
                beginning.push(values[key])
            }
        }
        let string = beginning.join(" & ");
        if (key === "Summe") {
            rows.push('\\rowcolor[HTML]{ECF4FF}')
        }
        if(keysArray.indexOf(key) == keysArray.length -2){
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





