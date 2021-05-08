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
		buffer.entryTags[key] = el.entryTags[key];

		// Klare Herausgeberschaft statt Autorenschaft
		if((key === "author" && buffer.entryTags["author"] === "Amazon Web Services, Inc.") || (key === "url" && buffer.entryTags["url"].includes("amazon.com"))){
			if(buffer.entryTags["author"] && buffer.entryTags["author"].includes("Amazon Web Services")){
				buffer.entryTags.author = "";
				delete buffer.entryTags.author;
			}
			if(buffer.entryTags["organization"] && buffer.entryTags["organization"].includes("Amazon Web Services")){
				buffer.entryTags.organization = "";
				delete buffer.entryTags.organization;
			}
			buffer.entryTags["editor"] = "{Amazon Web Services, Inc.}";
		}
		if(key==="url" && buffer.entryTags.url){
			if(buffer.entryTags.url.includes("/?nc1=h_ls")){
				buffer.entryTags.url = buffer.entryTags.url.replace("/?nc1=h_ls", "")
			}

			if(buffer.entryTags.url.substr(-1) === '/'){
				buffer.entryTags.url = buffer.entryTags.url.substr(0, el.entryTags.url.length - 1);
			}

			// if(el.entryTags.url.includes("http://")|| el.entryTags.url.includes("https://")){
			// 	buffer.entryTags.url = buffer.entryTags.url.replace("https://", "")
			// 	buffer.entryTags.url = buffer.entryTags.url.replace("http://", "")
			// }

		
			
		}
		if(key === "year" && buffer.entryTags.year === "o.J."){
			buffer.entryTags.year = "nodate";
			buffer.entryTags.sortyear = 1
		}
		
		
	}	
	return buffer;
});

let tex = bibtexParse.toBibtex(sample, false);

await fs.writeFile(path.join(__dirname,'../includes/literatur-db.bib'), tex)
return "Corrected bib file";

}

main().then(console.log).catch(e => console.error(e))

