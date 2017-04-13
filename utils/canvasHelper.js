//canvasHelper.js
var black = '#353535'
var white = 'white'

function in_array(search, array) {
    for(var i in array){
        if (array[i] == search) {
            return true;
        }
    }
    return false;
}

function drawFourLines(ctx, left, right, top, gap, close) {
    ctx.beginPath()
    ctx.moveTo(left, top)
    ctx.lineTo(right, top)
    ctx.moveTo(left, top+gap)
    ctx.lineTo(right, top+gap)
    ctx.moveTo(left, top+gap*2)
    ctx.lineTo(right, top+gap*2)
    ctx.moveTo(left, top+gap*3)
    ctx.lineTo(right, top+gap*3)
    if (close) {
        ctx.moveTo(left, top)
        ctx.lineTo(left, top+gap*3)
        ctx.moveTo(right, top)
        ctx.lineTo(right, top+gap*3)
    }
    ctx.stroke()
}

function drawX(ctx, left, top, signWidth) {
    ctx.beginPath()
    ctx.moveTo(left - signWidth, top - signWidth)
    ctx.lineTo(left + signWidth, top + signWidth)
    ctx.moveTo(left + signWidth, top - signWidth)
    ctx.lineTo(left - signWidth, top + signWidth)
    ctx.stroke()
}

function drawPause(ctx, left, top, gap, halfDepth) {
    var w = gap / 8
    if (halfDepth == 0) {
        ctx.beginPath()
        var alpha = 0.66
        var offsetX = gap / 16
        var offsetY = gap / 8
        var x1 = left - w
        var y1 = top + gap
        var x2 = left + w
        var y2 = top + gap * (1 + alpha)
        ctx.moveTo(x1, y1)
        ctx.bezierCurveTo(x2, y1 + offsetY, x2 - offsetX, y2 - offsetY, x1 - offsetX, y2)
        var x3 = x2 + gap / 12
        var y3 = top + gap * 2 + 2
        ctx.lineTo(x3, y3)
        var x4 = x3 - (x2 - x1)
        var y4 = y3 - (y2 - y1)
        ctx.bezierCurveTo(x4, y3 - offsetY, x4 + offsetX, y4 + offsetY, x3 + offsetX, y4)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(x3, y3)
        var x5 = x1 - w * 3
        var y5 = top + gap * 2
        var x6 = (x1 + x2) / 2
        var y6 = top + gap * 2.5
        ctx.quadraticCurveTo(x5, y5, x6, y6)
        var x7 = x1 - w
        var y7 = y5
        ctx.quadraticCurveTo(x7, y7, x3, y3)
        ctx.stroke()
        ctx.fill()
    } else {
        if (halfDepth > 4) {
            halfDepth = 4
        }
        ctx.beginPath()
        var r = gap / 7
        var alpha = 0.6
        var tadPoleGap = gap * 0.45
        var k = 3.5
        var y1 = top + gap * (2 + 0.2 * halfDepth)
        var y2 = top + gap * (1 + alpha - 0.2 * halfDepth)
        var delta = (y1 - y2) / k / 2
        var x1 = left - delta
        var x2 = left + delta
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        for (var i = 0; i < halfDepth; i++) {
            drawTadPole(ctx, x2 - i * tadPoleGap / k, y2 + i * tadPoleGap, w, r)
        }
    }
}

function drawTadPole(ctx, s_left, s_top, w, r) {
    ctx.beginPath()
    ctx.moveTo(s_left, s_top)
    var x1 = s_left - w * 2
    var y1 = s_top + w * 2
    var x2 = s_left - w * 3
    var y2 = s_top + r
    ctx.quadraticCurveTo(x1, y1, x2, y2)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(x2, s_top + 1, r, 0, 2 * Math.PI)
    ctx.fill()
}

function drawTab(content, canvasId) {
    // 如果修改参数，相应也要修改 /utils/contentParser.js 中的 maxWidth 和 music.wxss 中的宽高
    var width = 300, height = 65, gap = 15, fontGap = 7, fontSize = 12
    var top = (height - gap * 3) / 2, left = 3, right = left + fontGap * (Math.max(
        content[0].length,
        content[1].length,
        content[2].length,
        content[3].length
    ) - 1)
    var offset = (width - (right - left)) / 2
    left += offset
    right += offset

    var ctx = wx.createCanvasContext(canvasId)
    ctx.setStrokeStyle(black)
    ctx.setLineWidth(1)
    drawFourLines(ctx, left, right, top, gap, false)

    ctx.setFontSize(fontSize)
    for (var i = 0; i < content.length; i++) {
        var line = content[i]
        for (var j = 0; j < line.length; j++) {
            if (line[j] == '|' && i == 0) {
                if (j + 1 < line.length && line[j+1] == '|') {
                    if (j + 1 == line.length - 1) {
                        ctx.beginPath()
                        ctx.setLineWidth(2.5)
                        ctx.moveTo(left + (j + 1) * fontGap, top)
                        ctx.lineTo(left + (j + 1) * fontGap, top + gap * 3)
                        ctx.stroke()
                        ctx.beginPath()
                        ctx.setLineWidth(1)
                        ctx.moveTo(left + j * fontGap, top)
                        ctx.lineTo(left + j * fontGap, top + gap * 3)
                        ctx.stroke()
                    } else {
                        ctx.beginPath()
                        ctx.setLineWidth(2.5)
                        ctx.moveTo(left + j * fontGap, top)
                        ctx.lineTo(left + j * fontGap, top + gap * 3)
                        ctx.stroke()
                        ctx.beginPath()
                        ctx.setLineWidth(1)
                        ctx.moveTo(left + (j + 1) * fontGap, top)
                        ctx.lineTo(left + (j + 1) * fontGap, top + gap * 3)
                        ctx.stroke()
                    }
                    j++
                } else {
                    ctx.beginPath()
                    ctx.moveTo(left + j * fontGap, top)
                    ctx.lineTo(left + j * fontGap, top + gap * 3)
                    ctx.stroke()
                }
            } else if (!isNaN(parseInt(line[j]))) {
                ctx.beginPath()
                ctx.setFillStyle(white)
                ctx.arc(left + j * fontGap, top + i * gap, fontSize / 2, 0, 2 * Math.PI)
                ctx.fill()
                ctx.setFillStyle(black)
                ctx.fillText(line[j], left + (j - 0.5) * fontGap, top + i * gap + fontSize * 0.5);
            }
        }
    }
    ctx.draw()
}

function drawRhythm(content, canvasId) {
    // 如果修改参数，相应也要修改 music.wxss 中的宽高；其中高度不一定需要相等，宽度根据本函数返回值动态变化
    var height = 110, gap = 12, signGap = 20
    var top = (height - gap * 3) / 2, left = 3

    var ctx = wx.createCanvasContext(canvasId)
    ctx.setStrokeStyle(black)
    ctx.setFillStyle(black)
    ctx.setLineWidth(1)

    var pos = 0
    var lastSignType = ''
    var lastData = {}
    var halfStart = []
    var gapForHalf = 4
    var pointRecordsForSingleHalf = { 0: false }
    var singleHalfStart = { 0: [] }
    for (var i = 0; i < content.length; i++) {
        if (!isNaN(parseInt(content[i])) && content[i] >= 1 && content[i] <= 4) {
            var signType = '1-4'
            var mark = {'1': false, '2': false, '3': false, '4': false}
            mark[content[i]] = true
            var j
            for (j = i + 1; j < content.length && !isNaN(parseInt(content[j])); j++) {
                if (content[j] >= 1 && content[j] <= 4) {
                    mark[content[j]] = true
                }
            }
            i = j - 1
            var data = { mark, halfDepth: halfStart.length }
            var t_left = left + (pos + 1) * signGap
            drawSign(ctx, signType, t_left, top, gap, data)
            pos++
            lastSignType = signType
            lastData = data
        } else if (in_array(content[i], ['d', 'u', '|', '>', 'w', 'o', '-', 'x', '0'])) {
            var signType = content[i]
            if (content[i] == 'x') {
                if (i + 1 < content.length && content[i+1] == 'u') {
                    signType = 'xu'
                    i++
                } else if (i + 1 < content.length && content[i+1] == 'd') {
                    signType = 'xd'
                    i++
                } else {
                    signType = 'xd'
                }
            }
            var data = { halfDepth: halfStart.length }
            var t_left = left + (pos + 1) * signGap
            drawSign(ctx, signType, t_left, top, gap, data)
            pos++
            lastSignType = signType
            lastData = data
        } else if (content[i] == '~') {
            ctx.beginPath()
            var t_start = left + pos * signGap
            var t_end = t_start + signGap
            var t_top_high = 5
            var t_top_low = 12
            ctx.moveTo(t_start, t_top_low)
            ctx.bezierCurveTo(t_start, t_top_high, t_end, t_top_high, t_end, t_top_low)
            ctx.stroke()
            var t_left = left + (pos + 1) * signGap
            drawSign(ctx, lastSignType, t_left, top, gap, Object.assign(lastData, {
                halfDepth: halfStart.length
            }))
            pos++
            lastSignType = ''
        } else if (content[i] == '(') {
            halfStart.push(pos)
            Object.assign(pointRecordsForSingleHalf, {
                [halfStart.length]: false
            })
            Object.assign(singleHalfStart, {
                [halfStart.length]: []
            })
        } else if (content[i] == ')') {
            var t_start = left + (halfStart.pop() + 1) * signGap
            var t_end = left + pos * signGap
            var t_top = top + gap * 6 - halfStart.length * gapForHalf
            if (t_start != t_end) {
                ctx.beginPath()
                ctx.moveTo(t_start, t_top)
                ctx.lineTo(t_end, t_top)
                ctx.stroke()
            } else {
                if (pointRecordsForSingleHalf[halfStart.length]) {
                    ctx.beginPath()
                    ctx.moveTo(t_end - signGap / 2, t_top)
                    ctx.lineTo(t_end, t_top)
                    ctx.stroke()
                }
                singleHalfStart[halfStart.length].push(t_start)
            }
        } else if (content[i] == '.' && pos > 0) {
            ctx.beginPath()
            var t_left = left + pos * signGap + gapForHalf
            var t_top = top + gap * 6 - halfStart.length * gapForHalf
            ctx.arc(t_left, t_top, 1.5, 0, 2 * Math.PI)
            ctx.fill()
            if (singleHalfStart[halfStart.length].length > 0) {
                ctx.beginPath()
                do {
                    var t_start = singleHalfStart[halfStart.length].pop()
                    var t_top = top + gap * 6 - halfStart.length * gapForHalf
                    ctx.moveTo(t_start, t_top)
                    ctx.lineTo(t_start + signGap / 2, t_top)
                } while (singleHalfStart[halfStart.length].length > 0)
                ctx.stroke()
            }
            Object.assign(pointRecordsForSingleHalf, {
                [halfStart.length]: true
            })
        }
    }
    if (halfStart.length > 0) {
        ctx.beginPath()
        do {
            var t_start = left + (halfStart.pop() + 1) * signGap
            var t_end = left + pos * signGap
            var t_top = top + gap * 6 - halfStart.length * gapForHalf
            ctx.moveTo(t_start, t_top)
            ctx.lineTo(t_end, t_top)
        } while (halfStart.length > 0)
        ctx.stroke()
    }

    var width = (pos + 1) * signGap + left * 2
    drawFourLines(ctx, left, width - left, top, gap, true)

    ctx.draw()
    return width
}

function drawSign(ctx, signType, left, top, gap, data) {
    var signWidth = 4
    var adjustedSignWidth = signWidth + 2
    switch (signType) {
    case '1-4':
        var minN = 4, mark = data.mark
        for (var n in mark) {
            if (mark[n]) {
                drawX(ctx, left, top + gap * (n - 1), signWidth)
                if (n < minN) {
                    minN = n
                }
            }
        }
        ctx.beginPath()
        ctx.moveTo(left, top + gap * (minN - 1))
        ctx.lineTo(left, top + gap * 4)
        ctx.stroke()
        break
    case 'd':
    case 'xd':
    case '>':
    case 'o':
        ctx.beginPath()
        ctx.moveTo(left, top - gap)
        ctx.lineTo(left, top + gap * 4)
        ctx.moveTo(left - adjustedSignWidth, top - gap + adjustedSignWidth)
        ctx.lineTo(left, top - gap)
        ctx.lineTo(left + adjustedSignWidth, top - gap + adjustedSignWidth)
        ctx.stroke()
        if (signType == 'xd') {
            for (var i = 0; i < 3; i++) {
                drawX(ctx, left, top + gap * (i + 0.5), signWidth)
            }
        } else if (signType == '>') {
            ctx.beginPath()
            var t_adjustedSignWidth = signWidth - 1
            var alpha = 0.25
            ctx.moveTo(left - t_adjustedSignWidth, top - gap * (1.5 + alpha))
            ctx.lineTo(left + t_adjustedSignWidth, top - gap * 1.5)
            ctx.lineTo(left - t_adjustedSignWidth, top - gap * (1.5 - alpha))
            ctx.stroke()
        } else if (signType == 'o') {
            ctx.beginPath()
            ctx.arc(left, top - gap * 1.5, 2, 0, 2 * Math.PI)
            ctx.fill()
        }
        break
    case 'u':
    case 'xu':
        ctx.beginPath()
        ctx.moveTo(left, top - gap)
        ctx.lineTo(left, top + gap * 4)
        ctx.moveTo(left - adjustedSignWidth, top + gap * 4 - adjustedSignWidth)
        ctx.lineTo(left, top + gap * 4)
        ctx.lineTo(left + adjustedSignWidth, top + gap * 4 - adjustedSignWidth)
        ctx.stroke()
        if (signType == 'xu') {
            for (var i = 0; i < 3; i++) {
                drawX(ctx, left, top + gap * (i + 0.5), signWidth)
            }
        }
        break
    case 'w':
        ctx.beginPath()
        var offset = signWidth * 1.5
        ctx.moveTo(left, top - gap)
        ctx.lineTo(left, top)
        for (var i = 0; i < 3; i++) {
            ctx.bezierCurveTo(left - offset, top + gap * (i + 1/3), left + offset, top + gap * (i + 2/3), left, top + gap * (i + 1))
        }
        ctx.lineTo(left, top + gap * 4)
        ctx.moveTo(left - adjustedSignWidth, top - gap + adjustedSignWidth)
        ctx.lineTo(left, top - gap)
        ctx.lineTo(left + adjustedSignWidth, top - gap + adjustedSignWidth)
        ctx.stroke()
        break
    case '|':
        ctx.beginPath()
        ctx.moveTo(left, top)
        ctx.lineTo(left, top + gap * 3)
        ctx.stroke()
        break
    case '-':
        ctx.beginPath()
        ctx.setLineWidth(2)
        ctx.moveTo(left - adjustedSignWidth, top + gap * 1.5)
        ctx.lineTo(left + adjustedSignWidth, top + gap * 1.5)
        ctx.stroke()
        ctx.setLineWidth(1)
        break
    case '0':
        var halfDepth = data.halfDepth
        drawPause(ctx, left, top, gap, halfDepth)
        break
    }
    var halfDepth = data.halfDepth
    if (halfDepth) {
        ctx.beginPath()
        ctx.moveTo(left, top + gap * 4.5)
        ctx.lineTo(left, top + gap * 6)
        ctx.stroke()
    }
}

module.exports = {
  drawTab,
  drawRhythm
}