/*
 * @Author: Crayon
 * @Date: 2022-09-01 14:33:09
 * @Last Modified by: Crayon
 * @LastEditTime: 2022-09-01 15:15:07
 */
const DIR = './assets'
const SUFFIX = '.json'
const DIST = './dist'
const DEST_NAME = 'index.js'
const TEMPLATE = `
const friendLinkList = $$
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