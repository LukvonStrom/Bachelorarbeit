const fs = require('fs').promises
const path = require('path')
const fg = require('fast-glob')

async function main(){
    const latexfiles = await fg(['../content/**/*.tex'], { dot: true });

    let results = {}


    let keywords = ["\\chapter", "\\section", "\\subsection"]

    for(let file of latexfiles){
        const fileContent = (await fs.readFile(path.join(__dirname, file))).toString()
        let newLines = []
        for(const line of fileContent.split('\r\n')){
            
            let matches = k => {
                if(!line.includes("\\label") && !line.includes('*')){
                    let index = line.indexOf(k);
                    let searchString = line.slice(index, line.length-1)
                    let openIndex = searchString.indexOf('{')
                    let closeIndex = searchString.indexOf('}')

                    let result = searchString.slice(openIndex+1, closeIndex)
                    let nuLine = line +"\\label{"+k+":"+(result.replace(/ /g, '-')).replace(',', '')+"}"
                    newLines.push(nuLine);
                }else{
                    newLines.push(line)
                }
            }

                if(line.includes("\\chapter{")){
                    matches("chapter")
                }else if(line.includes("\\section{")){
                    matches("section")
                }else if(line.includes("\\subsection{")){
                    matches("subsection")
                }else{
                    newLines.push(line)
                }

        }

        
        await fs.writeFile(path.join(__dirname, file), newLines.join('\r\n'))
        
    }
    //console.log(results)
    //

}
main().catch(console.error)