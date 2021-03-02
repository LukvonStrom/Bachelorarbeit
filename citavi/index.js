var bibtexParse = require('@orcid/bibtex-parse-js');
const fs = require('fs').promises;
const path = require('path');

async function main(){

const file = await fs.readFile(path.join(__dirname,'citavi.bib'))
let text = file.toString()

var sample = bibtexParse.toJSON(text);
let removableAttributes = ["abstract", "doi", "isbn", "language", "note", "file", "keywords", "issn"]
sample = sample.map(el => {
	if(!el || !el.entryTags){
		throw new Exception("Data not formatted properly");
	}
	for(let attribute of removableAttributes){
		if(el.entryTags[attribute]){
			delete el.entryTags[attribute]
		}		
	}
	return el;
});

let tex = bibtexParse.toBibtex(sample, false);

await fs.writeFile(path.join(__dirname,'../includes/literatur-db.bib'), tex)
return "Corrected bib file";

}

main().then(console.log).catch(e => console.error(e))

