/*
* @Author: Tai Dong <dongtaiit@gmail.com>
* @Date:   2019-09-09 22:55:36
* @Last Modified by:   Tai Dong
* @Last Modified time: 2019-09-09 22:55:42
*/

const {api} = require('./src')
// const {api} = require('./lib')

let doSmth = async()=>{
  let res = await  api.getStateAsync('travel/@hoang/d1c9ea67-213c-4df4-ade6-97650210742d')
  console.log('api', JSON.stringify(res, null, 2))
}

doSmth()