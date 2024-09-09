// Score Editor by Hou Lam Wu (Eagle) 2023
const path = require('path');
const Max = require('max-api');

// let currentSectionObj = {}
let currentParamObj = {}
let currentParam = -1
let currentSection = -1
let currentScore = ''
let tempParam = []
// let tempScore = []
// let currentSectionName = ''
// let name = 'score'
// let lineMode = 0

// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Default Parameters

const loadScore = () => {
    return Max.getDict(currentScore).then((v) => {
        Max.post("Dict Reference: " + currentScore)
        const out = ['scoreSectionSelector']
        v.score.forEach((sec) => {
		    out.push(sec.section)
        })
        return Max.outlet(out).then(
                Max.outlet('currentParamSection')
            ).then(
                Max.outlet('currentSectionParam')
            ).then(
                Max.outlet('currentSectionTime')
            ).then(
                Max.outlet(['currentScoreName', v.name])                
            ).then(
                Max.post("Score Name: " + v.name)
            ).then(
                Max.outlet('currentParamFunction')
            ).then(
                Max.outlet('scoreSectionParamsSelector')
            ).then(
                Max.outlet('currentParamLine')
            ).then(
                Max.outlet('currentParamCrv')
            )
    }).catch(() => {
    initScore(currentScore)
    console.error(`Score not found, creating new score, create a dict ${currentScore} to access it`)
    Max.post(`Score not found, creating new score, create a dict ${currentScore} to access it`)
  })
}

const loadSection = (x) => {
    if (currentScore === '' || currentScore === null || currentScore === undefined) return
    return Max.getDict(currentScore).then((v) => {
        const out = ['scoreSectionParamsSelector']
        const out2 = ['currentSectionTime']
        const out3 = ['currentSectionParam']
        Max.post("Current Section Name: " + v.score[currentSection].section)
        v.score[currentSection].param.forEach((param) => {
            out.push(param.name.replace(v.score[currentSection].section + "-", ""))
            out2.push(param.param)
            out3.push(param.time)
        })
        return Max.outlet(out2).then(
            () => Max.outlet(out3)
        ).then(
            () => Max.outlet('currentParamFunction')
        ).then(() => {
            if (!x) return Max.outlet(out)
        }).then(
            () => Max.outlet(['startOffset', v.score[currentSection].startOffset])
        ).then(
            () => Max.outlet(['duration', v.score[currentSection].duration])
        )
    })
}

Max.addHandler("score", (string) => {
    if (!string) return
    currentScore = string
    loadScore()
})

Max.addHandler("currentSection", (i) => {
	// Max.post("Current Section");
    // Max.getDict(currentScore).then((v) => {
    //     v.score.forEach((sec, i) => {
    //         if (sec.section === string) {
    //             currentSectionObj = sec
    //             currentSection = i
    //         }
    //     })
    //     Max.post("Current Section Name: " + string)
    //     const out = ['scoreSectionParamsSelector']
    //     currentSectionObj.param.forEach((param) => {
	// 	    out.push(param.name)
    //     })
    // })
    currentSection = i
    loadSection()
    
});

const refreshParam = () => {
    if (currentScore === '' || currentScore === null || currentScore === undefined) return
    Max.getDict(currentScore).then((v) => {
        const obj = v.score[currentSection].param[currentParam]
        currentParamObj = obj
            const out1 = ['currentParamFunction']
            const out2 = ['currentParamLine']
            const out3 = ['currentParamCrv']
            const curve = ((obj.lineMode === 'curve') && (obj.crv))
            const paramArr = obj.param.split(' ')
            const timeArr = obj.time.split(' ')
            const crvArr = curve ? obj.crv.split(' ') : null
            // in Function format: x y pairs
            const reduced = timeArr.reduce((a, b, i) => [...a, (a[i - 1] || 0) + Number(b)], [])
            let min = 0
            let max = 1
            paramArr.forEach((num, i) => {
                if (num === '') return
                const val = Number(num)
                out1.push(Number(reduced[i]))
                out1.push(val)
                out2.push(val)
                out2.push(Number(timeArr[i]))
                if (curve) {
                    out3.push(Number(crvArr[i]))
                }
                min = (val < min) ? val : min
                max = (val > max) ? val : max
            })
            const out4 = ['currentParamRange', min, max]
                Max.outlet(out1).then(
                    () => Max.outlet(out2)
                ).then(
                    () => Max.outlet(out3)
                ).then(
                    () => Max.outlet(out4)
                )
        })
}

const loadParam = (i) => {
    Max.getDict(currentScore).then((v) => {
        const obj = v.score[currentSection].param[i]
        currentParam = i
        const out4 = ['currentParamMode', ((obj.lineMode === 'curve') ? 1 : 0)]
            Max.outlet(out4).then(
                    () => refreshParam()
                )
            Max.post("Param Editing: " + obj.name);
    })
}

Max.addHandler("currentParam", (i) => {
    if (currentSection < 0) return
    loadParam(i)
});

// param is stored in a string, for easy reading and editing in text
// I'll just do the param array to string in the max patch
// Line Mode is set to reflect the current settings
Max.addHandler("fromEditor", (i, name, param, time, crv) => {
    if (currentSection < 0) return
    // In order to preserve original crv, if present
    let out
    if (crv) {
        out = {
            "name": name,
            "lineMode": 'curve',
            "param": param,
            "time": time,
            "crv": crv
        }
    } 
    if (!crv && currentParamObj.crv) {
    //     const timeArr = time.split(' ')
    //     const oldTimeArr = currentParamObj.time.split(' ')
    //     const crvArr = currentParamObj.crv.split(' ')
    //     let newCrv
    //     if (timeArr.length < crvArr.length) {
    //         let tempIndex = 0
    //         newCrv = oldTimeArr.reduce((a, b, i) => {
    //             if (b === timeArr[i - tempIndex]) return  [...a, crvArr[i - tempIndex]]
    //             tempIndex += 1
    //             return  [...a]
    //         }
    //         , []).join(' ')
    //  }
    //     if (timeArr.length > crvArr.length) {
    //         let tempIndex = 0
    //         newCrv = timeArr.reduce((a, b, i) => {
    //             if (b === oldTimeArr[i - tempIndex]) return [...a, crvArr[i - tempIndex]]
    //             tempIndex += 1
    //             return  [...a, 0]
    //         }
    //         , []).join(' ')
    //     }
    //     if (timeArr.length === crvArr.length) {
    //         newCrv = currentParamObj.crv
    //     }
    // This is used to preserve the crv parameters if it changes to line mode
    // If points are added / removed this will not work and bug out
    // Which is too hard too fix, which is best to stay in curve mode if you edit, and change the linemode in the end
        out = {
            "name": name,
            "lineMode": 'line',
            "param": param,
            "time": time,
            "crv": currentParamObj.crv
        }
    }
    if (!crv && !currentParamObj.crv) {
        out = {
            "name": name,
            "lineMode": 'line',
            "param": param,
            "time": time
        }
    }
    // console.log(out)
    currentParamObj = out
    const path = `score[${currentSection}].param[${i}]`
    Max.updateDict(currentScore, path, out).then(() => loadSection(1)).then(() => refreshParam())
    // Max.post("section to score")
})


// Default Parameters

Max.addHandler("name", (string) => {
    Max.updateDict(currentScore, 'name', string)
    Max.post("Score Name: " + string)

})

Max.addHandler("lineMode", (int) => {
    if (currentScore < 0 || currentSection < 0) return
    const lineMode = (int) ? 'curve' : 'line'
    Max.updateDict(currentScore, `score[${currentSection}].param[${currentParam}].lineMode`, lineMode).then(() => refreshParam())
	Max.post("Line Mode: " + lineMode)
})

// Store param to temp array and write only when newSection is received
// This prevents writing directly to dict if there is a large amount of message at the same time
// the getDict may not return the updated data correctly and fuck up the output
Max.addHandler("param", (string, value) => {
	Max.post("TempParam Stored");
    const obj = { "name": string,
    "param": value.toString() || 0,
    "time": "0" 
    }
    tempParam.push(obj)
});

Max.addHandler("newSection", (newName) => {
    if (currentScore === '' || currentScore === null || currentScore === undefined) return
	Max.post("Write Section to Score " + newName);
    const out = {
        "section": newName,
        "startOffset": 0,
        "duration": 1,
        "param": tempParam
    }
    tempParam = []
    Max.getDict(currentScore).then((v) => {
        const ind = v.score.length
        const path = `score[${ind}]`
        Max.updateDict(currentScore, path, out).then(() => loadScore()).then(() => Max.outlet(['selectedSection', ind]))
        
    })
});

Max.addHandler("editStartOffset", (f) => {
    if (currentSection < 0) return
    const path = `score[${currentSection}].startOffset]`
    Max.updateDict(currentScore, path, f)
    Max.post("Update Section Start Offset " + f)
})
Max.addHandler("editDuration", (f) => {
    if (currentSection < 0) return
    const path = `score[${currentSection}].duration]`
    Max.updateDict(currentScore, path, f)
    Max.post("Update Section Duration " + f)
})

Max.addHandler("newParam", (string, value) => {
    if (currentSection < 0) return
	Max.post("Write Param to Section " + string)
    const obj = { 
        "name": string,
        "param": value.toString() || 0,
        "time": "0" 
    }
    Max.getDict(currentScore).then((v) => {
        const ind = v.score[currentSection].param.length
        const path = `score[${currentSection}].param[${ind}]`
        Max.updateDict(currentScore, path, obj).then(() => loadSection()).then(() => Max.outlet(['selectedParam', ind]))
    }).catch(() => {
        console.error(`No current section`)
        Max.post("No current section")
      })
});

Max.addHandler("deleteSection", (string) => {
    if (currentSection < 0) return
	Max.post("Delete Section " + string);
    Max.getDict(currentScore).then((v) => {
        const oldArr = v.score
        const updatedArr = oldArr.filter(item => item.section !== string)
        const path = `score`
        currentSection = -1
        Max.updateDict(currentScore, path, updatedArr).then(() => loadScore())  
    })
});

Max.addHandler("deleteParam", (string) => {
    if (currentSection < 0) return
	Max.post("Delete Param " + string);
    Max.getDict(currentScore).then((v) => {
        const oldArr = v.score[currentSection].param
        const updatedArr = oldArr.filter(item => item.name !== string)
        const path = `score[${currentSection}].param`
        currentParam = -1
        Max.updateDict(currentScore, path, updatedArr).then(() => loadSection())  
    })
});

// Max.addHandler("sectionToDict", (string) => {
// 	Max.post("Write Section to Dict");
//     const out = {
//         "section": currentSectionName,
//         "startOffset": 0,
//         "duration": 1,
//         "param": tempParam
//     }
//     Max.setDict(string, out)
//     Max.post("Output Dict: " + string)
//     Max.post("Section NOT cleared")
// });
// Max.addHandler("write", (string) => {
// 	Max.post("Initiate Score to Dict");
//     const out = {
//         "name": name,
//         "score": []
//     }
//     Max.setDict(string, out)
//     Max.post("Output Dict: " + string)
//     Max.outletBang()
// });

const initScore = (string, name = 'Name') => {
    Max.post("Initiate Score to Dict: " + string + " Name: " + name);
    const out = {
        "name": name,
        "score": []
    }
    Max.setDict(string, out).then(() => {
        Max.post("Output Dict: " + string)
        currentScore = string
        loadScore()
    })
}

Max.addHandler("init", (string, name) => {
    initScore(string, name)
})

Max.addHandler("clear", () => {
    param = []
    score = []
    Max.post("clear all")
});