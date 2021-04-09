const fs = require('fs').promises
const path = require('path')
const fg = require('fast-glob')

async function main(){
    const acronym = await fs.readFile(path.join(__dirname, '../includes/abkuerzungen.tex'))
    const acronyms =  parseAcro(acronym.toString())
    const latexfiles = await fg(['../content/**/*.tex'], { dot: true });

    let results = {}

    for(let file of latexfiles){
        const fileContent = (await fs.readFile(path.join(__dirname, file))).toString()
        for(let acronym of acronyms){

            const indizes = [/*...fileContent.matchAll(new RegExp(lowercase, 'gi')), 
            ...fileContent.matchAll(new RegExp(uppercase, 'gi')), */
            ...fileContent.matchAll(new RegExp(acronym, 'gi'))].map(el => el.index)
            let didnotmatch = []
            for(let index of indizes){
                let occurence = fileContent[index]
                //"\ac{"
                //console.log(occurence, index, fileContent.slice(index-3, index))
                if(!fileContent.slice(index-4, index).includes("ac{") && (fileContent.slice(index-4, index).includes(" ") || fileContent.slice(index-4, index).includes("-"))){
                    didnotmatch.push({content: fileContent.slice(index-4, index+acronym.length)});
                }
            }
            if(didnotmatch.length>0){
                if(results[file] && results[file][acronym]){
                    results[file][acronym] = acronym;
                    results[file][acronym].hits = didnotmatch
                }else{
                    results[file] = {...results[file], acronym, hits: didnotmatch}
                }
                //console.log(file, acronym, didnotmatch)
            }
            
        }
    }
    //console.log(results)
    await fs.writeFile(path.join(__dirname, 'export.json'), JSON.stringify(results, null, 4))

}

function parseAcro(text){
    let buffer = []
    for(let line of text.split('\n')){
        let search = (/\acro{(\w*)}{(.*)}/g)
        let matches = search.exec(line)
        if(matches && matches[1]){
            buffer.push(matches[1])
        }
    }
    return buffer;
}

main().catch(console.error)