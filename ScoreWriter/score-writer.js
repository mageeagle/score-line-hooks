const path = require('path');
const Max = require('max-api');

let currentSection = ''
let name = 'score'
let param = []
let score = []

// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Default Parameters

Max.addHandler("name", (string) => {
	Max.post("Name Received");
    name = string
    Max.post("Score Name: " + name)

});

Max.addHandler("currentSection", (string) => {
	Max.post("Current Section");
    currentSection = string
    Max.post("Current Section Name: " + currentSection)

});

Max.addHandler("param", (string, value) => {
	Max.post("Param Received");
    const obj = { "name": string,
    "param": value.toString(),
    "time": "0" 
    }
    param.push(obj)
});

Max.addHandler("sectionToScore", () => {
	Max.post("Write Section to Score");
    const out = {
        "section": currentSection,
        "startOffset": 0,
        "duration": 1,
        "param": param
    }
    score.push(out)
    Max.post("section to score")
    param = []
});

Max.addHandler("sectionToDict", (string) => {
	Max.post("Write Section to Dict");
    const out = {
        "section": currentSection,
        "startOffset": 0,
        "duration": 1,
        "param": param
    }
    Max.setDict(string, out)
    Max.post("Output Dict: " + string)
    Max.post("Section NOT cleared")
});
Max.addHandler("write", (string) => {
	Max.post("Write Score to Dict");
    const out = {
        "name": name,
        "score": score
    }
    Max.setDict(string, out)
    Max.post("Output Dict: " + string)
    param = []
    score = []
    Max.outletBang()
    Max.post("Section CLEARED")
});

Max.addHandler("clear", () => {
    param = []
    score = []
    Max.post("clear all")
});