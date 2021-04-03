var bibtexParse = require('@orcid/bibtex-parse-js');
const fs = require('fs').promises;
const path = require('path');

async function main(){

const file = await fs.readFile(path.join(__dirname,'citavi.bib'))
let text = file.toString()

var sample = bibtexParse.toJSON(text);
let removableAttributes = ["abstract", "doi", "isbn", "language", "note", "file", "keywords", "issn", "pagetotal"]
sample = sample.map(el => {
	if(!el || !el.entryTags){
		throw new Exception("Data not formatted properly");
	}
	let keys = (Object.keys(el.entryTags)).filter(el2 => !removableAttributes.includes(el2))
	let buffer = Object.assign({}, el);
	buffer.entryTags = {}
	for (let key of keys){
		// Klare Herausgeberschaft statt Autorenschaft
		if((key === "author" && el.entryTags["author"] === "Amazon Web Services, Inc.") || (key === "url" && el.entryTags["url"].includes("amazon.com"))){
			if(el.entryTags["author"] === "Amazon Web Services, Inc."){
				buffer.entryTags["author"] = "";
			}
			buffer.entryTags["editor"] = "Amazon Web Services, Inc.";
		}
		if(key === "year" && el.entryTags[key] === "o.J."){
			buffer.entryTags[key] = "nodate";
		}else{
			buffer.entryTags[key] = el.entryTags[key];
		}
	}	
	return buffer;
});

let tex = bibtexParse.toBibtex(sample, false);

await fs.writeFile(path.join(__dirname,'../includes/literatur-db.bib'), tex)
return "Corrected bib file";

}

main().then(console.log).catch(e => console.error(e))

