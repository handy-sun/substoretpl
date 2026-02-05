const { type, name, istun } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}
const tun_inbound = {
  type: 'tun',
  tag: 'tun-in',
  address: [ '172.19.0.1/30', 'fdfe:dcba:9876::1/126' ],
  auto_route: true,
  auto_redirect: true,
  strict_route: true,
}

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}

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
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

let tun_flag = /^1$|true/i.test(istun) ? true : false
if (tun_flag) {
  config.inbounds.push(tun_inbound)
}

$content = JSON.stringify(config, null, 2)
