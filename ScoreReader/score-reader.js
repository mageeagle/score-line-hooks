const path = require('path');
const Max = require('max-api');

let currentScore = 'score';
let time = 60000
let startTime = 0
let startPortion = 0
let timeFactor = 1
// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Default Parameters

Max.addHandler("score", (string) => {
    if (!string) return
    currentScore = string
    Max.getDict(currentScore).then((v) => {
        Max.post("Dict Reference: " + currentScore)
        Max.post("Score Name : " + v.name)
        const out = ['scoreSectionSelector']
        v.score.forEach((sec) => {
		    out.push(sec.section)
    })
    Max.outlet(out).then(() => Max.outlet(["scoreName", v.name]))
}).catch(() => {
    console.error(`Score not found`)
    Max.post("Score Not Found")
  });

});

Max.addHandler("time", (num) => {
    time = num * timeFactor
    const str = 'Time set to ' + time + 'ms, ' + Math.floor(time / 60000) + 'min ' + ((time / 1000) % 60) + 'sec'
    Max.post(str)
    console.log(str)
});

Max.addHandler("format", (string) => {
    timeFactor = (string === 'min') ? (60 * 1000) : ((string === 'sec') ? 1000 : 1)
    const str = 'Time Setting Format set to ' + string
    Max.post(str)
    console.log(str)
});

Max.addHandler("startTime", (num) => {
    startTime = num * timeFactor
    startPortion = startTime / time
    const str = 'Start time set to ' + startTime.toPrecision(5) + 'ms, '  + Math.floor(startTime / 60000) + 'min ' + ((startTime / 1000) % 60).toPrecision(5) + 'sec, start portion: ' + startPortion.toPrecision(5)
    Max.post(str)
    console.log(str)
});

Max.addHandler("startPortion", (num) => {
    startPortion = num
    startTime = time * startPortion
    const str = 'Start time set to ' + startTime.toPrecision(5) + 'ms, '  + Math.floor(startTime / 60000) + 'min ' + ((startTime / 1000) % 60).toPrecision(5) + 'sec, start portion: ' + startPortion.toPrecision(5)
    Max.post(str)
    console.log(str)
});

function processParam (sec) {
    if (sec.param === undefined) return
    const secTime = sec.duration * time
    const initStartTime = sec.startOffset * time

    sec.param.forEach((obj) => {
        let thisStartTime = startTime
        const outArr = []
        outArr.push(obj.name)
        const paramArr = obj.param.split(' ')
        const timeArr = obj.time.split(' ')
        const count = paramArr.length
        const curveMode = (obj.lineMode === 'curve')
        const crvArr = (curveMode && obj.crv) ? obj.crv.split(' ') : null

        // If last value arrive time < start time
        // Sum of Time Running
        const sumTime = (timeArr.reduce((a, b) => a + Number(b), 0)) * secTime
        if ((sumTime + initStartTime) < startTime) {
            outArr.push(Number(paramArr[count - 1]))
            outArr.push(0)
            if (curveMode) outArr.push(0)
            Max.outlet(outArr)
        } else {
        // Offset
        const initParam = Number(paramArr[0])
        if ((thisStartTime <= initStartTime)) {
            outArr.push(initParam)
            outArr.push(0)
            if (curveMode) outArr.push(0)
            outArr.push(initParam)
            outArr.push(initStartTime - thisStartTime)
            if (curveMode) outArr.push(0)
            thisStartTime = 0
        }
        if ((thisStartTime > initStartTime)) {
            thisStartTime -= initStartTime
        }

        for (let i = 0; i < count; i++) {
            const t = Number(timeArr[i]) * secTime
            // Normal
            if (thisStartTime === 0) {
                outArr.push(Number(paramArr[i]))
                outArr.push(t)
                if (curveMode) outArr.push(Number(crvArr[i]))
            }
            // First Value
            if ((thisStartTime === t) && (thisStartTime !== 0)) {
                outArr.push(Number(paramArr[i]))
                outArr.push(0)
                if (curveMode) outArr.push(0)
                thisStartTime = 0
            }
            // In the middle of two values
            if ((thisStartTime < t) && (thisStartTime > 0)) {
                const timeLeft = t - thisStartTime
                const position = thisStartTime / t
                const lastParam = Number(paramArr[i - 1])
                const thisParam = Number(paramArr[i])
                const paramStart = lastParam + ((thisParam - lastParam) * position)
                outArr.push(paramStart)
                outArr.push(0)
                if (curveMode) outArr.push(0)
                outArr.push(thisParam)
                outArr.push(timeLeft)
                if (curveMode) outArr.push(Number(crvArr[i]))
                thisStartTime = 0
            }
            // Skipping before start time
            if (thisStartTime > t) {
                thisStartTime -= t
            }
        }
        Max.outlet([obj.name, 'curve', curveMode]).then(() => Max.outlet(outArr))
        }
    }) 
}

// Output all sections on score
Max.addHandler("bang", () => {
    Max.getDict(currentScore).then((v) => {
        v.score.forEach((sec) => {
			processParam(sec)
    })
    Max.post("Loaded All Sections")
    console.log("Loaded All Sections")
}).catch(() => {
    console.error(`Score not found`)
    Max.post("Score Not Found")
  })
})

// Output a list of sections on score
Max.addHandler("section", (...args) => {
    Max.getDict(currentScore).then((v) => {
        v.score.forEach((sec) => {
                if (args.includes(sec.section)) {
                    processParam(sec)
                }
        })
        Max.post("Loaded Sections: " + args)
        console.log("Loaded Sections: " + args)
    }).catch(() => {
        console.error(`Score not found`)
        Max.post("Score Not Found")
      })
})

// List Example
Max.addHandler("test", (...theArgs) => {
    console.log(theArgs)
})

// // Use the 'outlet' function to send messages out of node.script's outlet
// Max.addHandler("echo", (msg) => {
// 	Max.outlet(msg);
// });
