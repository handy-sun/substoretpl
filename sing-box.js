const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
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
  if (['HongKong'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /香港|沪港|呼港|中港|HKT|HKBN|HGC|WTT|CMI|穗港|广港|京港|🇭🇰|HK|Hongkong|Hong Kong|HongKong|HONG KONG/i))
  }
  if (['TaiWan'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /台湾|台灣|臺灣|台北|台中|新北|彰化|台|CHT|HINET|TW|Taiwan|TAIWAN/i))
  }
  if (['Japan'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /日本|东京|東京|大阪|埼玉|京日|苏日|沪日|广日|上日|穗日|川日|中日|泉日|杭日|深日|JP|Japan|JAPAN/i))
  }
  if (['Singapore'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新|狮|獅|sg|singapore|🇸🇬)/i))
  }
  if (['America'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:Aus)).*(🇺🇸|US|us|美国|美|京美|硅谷|凤凰城|洛|西雅图|圣何塞|芝加哥|哥伦布|纽约|广美|United States)/i))
  }
  // below is for exclude rules
  if (['Others'].includes(i.tag)) {
    const excludeRegex = /^(?!.*(?:Aus)).*(🇭🇰|HK|hk|香港|香|🇹🇼|TW|tw|台湾|台|🇸🇬|SG|sg|新加坡|狮|🇯🇵|JP|jp|日本|日|🇺🇸|US|us|美国|美|洛)/i;
    i.outbounds.push(...getTags(proxies).filter(tag => !excludeRegex.test(tag)));
  }
  if (['UrlTest'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
})

config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
