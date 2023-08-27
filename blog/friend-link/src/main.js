const fs = require('fs')
const minio = require('minio')

const DIR = 'assets'
const SUFFIX = 'json'
const DIST = 'index.json'

const CLASS_DESC = process.env['CLASS_DESC']
const CLASS_NAME = process.env['CLASS_NAME']

const ENDPOINT = process.env['ENDPOINT']
const PORT = process.env['PORT']
const ACCESS_KEY = process.env['ACCESS_KEY']
const SECRET_KEY = process.env['SECRET_KEY']
// BUCKET_NAME cdn
const BUCKET_NAME = process.env['BUCKET_NAME']
// OBJECT_NAME friend-link/index.json
const OBJECT_NAME = process.env['OBJECT_NAME']
// COMMIT_ID
const COMMIT_ID = process.env['COMMIT_ID'].substring(0, 6)
// OBJECT_NAMES 上传两个版本，一个覆盖index.json，一个携带commitID
const OBJECT_NAMES = [
    OBJECT_NAME,
    `${OBJECT_NAME}.${COMMIT_ID}`
]

function read() {
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

function generate() {
    let linkList = read()
    let obj = [
        {
            "class_desc": CLASS_DESC,
            "class_name": CLASS_NAME,
            "link_list": linkList
        }
    ]
    let content = JSON.stringify(obj)
    /* // 跳过证书认证
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
    // 下载头像图片
    assets.forEach(e => {
        request(e.avatar).pipe(
            fs.createWriteStream(`${DIST}/${e.name}.jpg`)
        )
    }) */
    fs.writeFileSync(`${DIST}`, content)
}

function minioUpload() {
    // Instantiate the minio client with the endpoint
    // and access keys as shown below.
    let client = new minio.Client({
        endPoint: ENDPOINT,
        port: Number(PORT),
        useSSL: false,
        accessKey: ACCESS_KEY,
        secretKey: SECRET_KEY
    })

    OBJECT_NAMES.forEach(objectName => {
        client.fPutObject(
            BUCKET_NAME,
            objectName,
            'index.json',
            {
                'Content-Type': 'application/json; charset=utf-8'
            },
            (err, obj) => {
                if (err) {
                    console.log("upload failed, err: %s", err)
                    process.exit(1)
                }
                console.log("upload success, objectName: %s, etag: %s, versionId: %s", objectName, obj.etag, obj.versionId)
            }
        )
    });
}

(function main() {
    generate()
    minioUpload()
})()