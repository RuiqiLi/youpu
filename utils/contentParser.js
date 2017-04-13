//contentParser.js
var MODE_NORMAL = 'MODE_NORMAL'
var MODE_TAB = 'MODE_TAB'
var MODE_CHORUS = 'MODE_CHORUS'

var EMPTY = 'EMPTY'
var CHANGE_MODE = 'CHANGE_MODE'
var TAB = 'TAB'
var META = 'META'
var COMMENT = 'COMMENT'
var RHYTHM = 'RHYTHM'
var LYRIC = 'LYRIC'
var CHORUS = 'CHORUS'

function parseContent(data) {
    console.log(data)
    var lines = data.split('\n')
    var meta = []
    var content = []

    var mode = MODE_NORMAL
    var tmp_content = []
    var canvasId = 1
    for (var i = 0; i < lines.length; i++) {
        var { lineType, value } = parseLine(lines[i], mode)
        switch (lineType) {
        case EMPTY:
            break
        case META:
            meta.push(value)
            break
        case TAB:
            tmp_content.push(value)
            break
        case COMMENT:
        case LYRIC:
            if (mode == MODE_CHORUS) {
                tmp_content.push({ lineType, value })
            } else {
                content.push({ lineType, value })
            }
            break
        case RHYTHM:
            if (mode == MODE_CHORUS) {
                tmp_content.push({ lineType, canvasId: canvasId++, value })
            } else {
                content.push({ lineType, canvasId: canvasId++, value })
            }
            break
        case CHANGE_MODE:
            if (mode == MODE_CHORUS && tmp_content.length > 0) {
                content.push({ lineType: CHORUS, value: tmp_content })
                tmp_content = []
            } else if (mode == MODE_TAB && tmp_content.length > 0) {
                for (var j = 0; j + 3 < tmp_content.length; j += 4) {
                    var maxWidth = 42
                    var width = Math.max(
                        tmp_content[j].length,
                        tmp_content[j+1].length,
                        tmp_content[j+2].length,
                        tmp_content[j+3].length
                    )
                    while (width > maxWidth) {
                        var slicePoint = maxWidth / 2
                        for (var k = slicePoint; k <= maxWidth; k++) {
                            if (tmp_content[j][k] == '|') {
                                slicePoint = k
                                break
                            }
                        }
                        content.push({ lineType: TAB, canvasId: canvasId++, value: [
                            tmp_content[j].slice(0, slicePoint + 1),
                            tmp_content[j+1].slice(0, slicePoint + 1),
                            tmp_content[j+2].slice(0, slicePoint + 1),
                            tmp_content[j+3].slice(0, slicePoint + 1)
                        ]})
                        tmp_content[j] = tmp_content[j].slice(slicePoint),
                        tmp_content[j+1] = tmp_content[j+1].slice(slicePoint),
                        tmp_content[j+2] = tmp_content[j+2].slice(slicePoint),
                        tmp_content[j+3] = tmp_content[j+3].slice(slicePoint)
                        width = Math.max(
                            tmp_content[j].length,
                            tmp_content[j+1].length,
                            tmp_content[j+2].length,
                            tmp_content[j+3].length
                        )
                    }
                    if (width > 1) {
                        content.push({ lineType: TAB, canvasId: canvasId++, value: [
                            tmp_content[j],
                            tmp_content[j+1],
                            tmp_content[j+2],
                            tmp_content[j+3]
                        ]})
                    }
                }
                tmp_content = []
            }
            if (value == MODE_NORMAL) {
                mode = MODE_NORMAL
            } else if (value == MODE_CHORUS) {
                mode = MODE_CHORUS
            } else if (value == MODE_TAB) {
                mode = MODE_TAB
            }
            break
        }
    }
    if (mode == MODE_CHORUS && tmp_content.length > 0) {
        content.push({ lineType: CHORUS, value: tmp_content })
    } else if (mode == MODE_TAB && tmp_content.length > 0) {
        for (var j = 0; j + 3 < tmp_content.length; j += 4) {
            content.push({ lineType: TAB, canvasId: canvasId++, value: [
                tmp_content[j],
                tmp_content[j+1],
                tmp_content[j+2],
                tmp_content[j+3]
            ]})
        }
    }
    return { meta, content }
}

function parseLine(line, mode) {
    line = line.trim()
    if (line.length == 0) {
        return {
            lineType: EMPTY,
            value: ''
        }
    }
    if (line == '{start_of_tab}') {
        return {
            lineType: CHANGE_MODE,
            value: MODE_TAB
        }
    }
    if (line == '{start_of_chorus}') {
        return {
            lineType: CHANGE_MODE,
            value: MODE_CHORUS
        }
    }
    if (line == '{end_of_tab}' || line == '{end_of_chorus}') {
        return {
            lineType: CHANGE_MODE,
            value: MODE_NORMAL
        }
    }
    if (mode == MODE_TAB) {
        return {
            lineType: TAB,
            value: line
        }
    }
    if (line.slice(0, 6) == '{meta:') {
        return {
            lineType: META,
            value: line.slice(6, -1).trim()
        }
    }
    if (line.slice(0, 9) == '{comment:') {
        return {
            lineType: COMMENT,
            value: line.slice(9, -1).trim()
        }
    }
    if (line.slice(0, 8) == '{rhythm:') {
        return {
            lineType: RHYTHM,
            value: line.slice(8, -1).trim()
        }
    }
    var value = []
    for (var i = 0, chord = "", isChord = false; i < line.length; i++) {
        if (line[i] == '[') {
            isChord = true
            continue
        }
        if (line[i] == ']') {
            isChord = false
            if (i == line.length - 1 && chord.length > 0) {
                value.push({
                    chord,
                    char: '空格'
                })
            }
            continue
        }
        if (isChord) {
            chord += (line[i] == 'b') ? '♭' : ((line[i] == '#') ? '♯' : line[i])
        } else {
            if (line[i] == ' ' && i + 1 < line.length && line[i+1] == ' ' && chord.length == 0) {
                continue
            }
            value.push({
                chord,
                char: (line[i] == ' ') ? '空格' : line[i]
                // 如果是空格，text控件会将其转为空，为了使其有宽度和高度，这里将空格转为'空格'
                // 由于其他字符一定是单字符，因此可以在wxml中根据内容将其重新识别为空格
            })
            chord = ""
        }
    }
    return {
        lineType: LYRIC,
        value
    }
}

function parseTab(lines) {

}

module.exports = {
  parseContent
}