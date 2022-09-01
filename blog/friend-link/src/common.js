/*
 * @Author: Crayon
 * @Date: 2022-09-01 14:33:09
 * @Last Modified by: Crayon
 * @LastEditTime: 2022-09-01 18:26:23
 */
const DIR = './assets'
const SUFFIX = '.json'
const DIST = './dist'
const DEST_NAME = 'index.js'
const TEMPLATE = `
const friendLinkList = [
    {
        "class_name": "友情链接",
        "class_desc": "那些人，那些事",
        "link_list": $$
    }
]
export default {
    friendLinkList
}
`;
module.exports = {
    DIR,
    SUFFIX,
    DIST,
    DEST_NAME,
    TEMPLATE
}