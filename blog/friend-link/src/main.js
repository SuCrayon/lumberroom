const fs = require('fs')
const minio = require('minio')
const aliyunOSS = require('ali-oss');

const DIR = 'assets'
const SUFFIX = 'json'
const DIST = 'index.json'

const CLASS_DESC = process.env['CLASS_DESC']
const CLASS_NAME = process.env['CLASS_NAME']

const MINIO_ENDPOINT = process.env['MINIO_ENDPOINT']
const MINIO_PORT = process.env['MINIO_PORT']
const MINIO_ACCESS_KEY = process.env['MINIO_ACCESS_KEY']
const MINIO_SECRET_KEY = process.env['MINIO_SECRET_KEY']
// BUCKET_NAME cdn
const MINIO_BUCKET_NAME = process.env['MINIO_BUCKET_NAME']
// OBJECT_NAME friend-link/index.json
const MINIO_OBJECT_NAME = process.env['MINIO_OBJECT_NAME']
// COMMIT_ID
const COMMIT_ID = process.env['COMMIT_ID'].substring(0, 6)
// OBJECT_NAMES 上传两个版本，一个覆盖index.json，一个携带commitID
const MINIO_OBJECT_NAMES = [
    MINIO_OBJECT_NAME,
    `${MINIO_OBJECT_NAME}.${COMMIT_ID}`
]

const ALIYUN_OSS_REGION = process.env['ALIYUN_OSS_REGION']
const ALIYUN_OSS_BUCKET = process.env['ALIYUN_OSS_BUCKET']
const ALIYUN_OSS_ACCESS_KEY = process.env['ALIYUN_OSS_ACCESS_KEY']
const ALIYUN_OSS_SECRET_KEY = process.env['ALIYUN_OSS_SECRET_KEY']
const ALIYUN_OSS_OBJECT_NAME = process.env['ALIYUN_OSS_OBJECT_NAME']
const ALIYUN_OSS_OBJECT_NAMES = [
    ALIYUN_OSS_OBJECT_NAME,
    `${ALIYUN_OSS_OBJECT_NAME}.${COMMIT_ID}`
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

function upload2Minio() {
    // Instantiate the minio client with the endpoint
    // and access keys as shown below.
    let client = new minio.Client({
        endPoint: MINIO_ENDPOINT,
        port: Number(MINIO_PORT),
        useSSL: false,
        accessKey: MINIO_ACCESS_KEY,
        secretKey: MINIO_SECRET_KEY
    })

    MINIO_OBJECT_NAMES.forEach(objectName => {
        client.fPutObject(
            MINIO_BUCKET_NAME,
            objectName,
            DIST,
            {
                "Content-Type": "application/json; charset=utf-8"
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

function upload2AliyunOSS() {
    let client = new aliyunOSS({
        region: ALIYUN_OSS_REGION,
        accessKeyId: ALIYUN_OSS_ACCESS_KEY,
        accessKeySecret: ALIYUN_OSS_SECRET_KEY,
        bucket: ALIYUN_OSS_BUCKET
    })

    let headers = {
        "Content-Type": "application/json; charset=utf-8"
    }

    ALIYUN_OSS_OBJECT_NAMES.forEach(objectName => {
        client.put(objectName, DIST, {headers})
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
            process.exit(1)
        })
    })
}

(function main() {
    generate()
    upload2Minio()
    upload2AliyunOSS()
})()