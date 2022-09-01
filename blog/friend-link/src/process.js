/*
 * @Author: Crayon
 * @Date: 2022-09-01 13:59:21
 * @Last Modified by: Crayon
 * @LastEditTime: 2022-09-01 19:22:15
 */
const fs = require('fs')
const request = require('request')
const {
    DIR, SUFFIX, DIST, DEST_NAME, TEMPLATE
} = require('./common')
const minimist = require('minimist')

function parse() {
    let dirs = fs.readdirSync(DIR).map(e => {
        return `${DIR}/${e}`
    })
    dirs = dirs.filter(e => {
        // 是文件且是.json后缀
        return fs.statSync(e).isFile() && e.endsWith(SUFFIX)
    })
    let res = []
    dirs.forEach(e => {
        let content = fs.readFileSync(e, { encoding: 'utf-8' })
        let obj = JSON.parse(content)
        if (obj['order'] === null || obj['order'] === undefined) {
            obj['order'] = Infinity
        }
        res.push(obj)
    })
    console.log(`total parse ${res.length}`)
    // 根据order字段排序
    res.sort()
    return res
}

function build() {
    let assets = parse()
    let content = TEMPLATE.replace('$$', JSON.stringify(assets)).trimStart('\n')
    if (!fs.existsSync(DIST)) {
        fs.mkdirSync(DIST)
    }
    // 跳过证书认证
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
    // 下载头像图片
    assets.forEach(e => {
        request(e.avatar).pipe(
            fs.createWriteStream(`${DIST}/${e.name}.jpg`)
        )
    })
    fs.writeFileSync(`${DIST}/${DEST_NAME}`, content)
}

function help() {
    console.log(`
Usage: node process.js parse
       node process.js build
       node process.js help
    `)
}

(function main() {
    let args = minimist(process.argv.slice(2))
    let funcName = args._[0]
    console.log(`exec func: ${funcName}`)
    eval(`${funcName}()`)
    console.log('exec success')
})()