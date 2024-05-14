export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function sleep(ms: number) {
  return new Promise((resove) => {
    setTimeout(resove, ms);
  });
}

export class logger {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  log(msg: string) {
    console.log('\x1b[32m%s\x1b[0m %s', `[ ${this.name} ] : `, msg);
  }
}
