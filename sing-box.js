const args =
  typeof $arguments !== 'undefined'
    ? $arguments
    : {
        type: 0,
        name: '_',
        istun: 0,
      }
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}
const tun_inbound = {
  type: 'tun',
  tag: 'tun-in',
  address: [ '172.19.0.1/30', 'fdfe:dcba:9876::1/126' ],
  mtu: 9000,
  auto_route: true,
  strict_route: true,
}

function sblog(v) {
  console.log(`[📦sing-box] ${v}`)
}
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}

sblog('🚀 开始 args:', args)
// 如果是直接在软件中粘贴脚本的，就手动修改下面这几个变量实现自定义配置
let {
  type = args.type || 0,
  name = args.name || '_',
  istun = /^1$|true/i.test(args.istun) ? true : false,
} = args
sblog(`传入参数 type: ${type}, name: ${name}, istun: ${istun}`)
let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['Proxy'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
  if (['UrlTest'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
})

let compatible
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag)
  }
});

if (istun) {
  config.inbounds.push(tun_inbound)
  config.route.rules[0].inbound = 'tun-in'
  sblog(`route.rules[0]更新为: ${JSON.stringify(config.route.rules[0])}`)
}

$content = JSON.stringify(config, null, 2)
