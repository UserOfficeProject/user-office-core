import dns from 'node:dns';

export function setDefaultResultOrder() {
  dns.setDefaultResultOrder('ipv4first');
}
