import { Bench } from "tinybench";
import { Decimal } from 'decimal.js';

const bench = new Bench({ time: 2000 });

const limit = new Array(65000).fill(0).map((_, i) => new Decimal(i));

const mathSum = arr => () => Decimal.sum(new Decimal(0), ...arr);
const mathSumApply = arr => () => Decimal.sum.apply(Decimal, [new Decimal(0), ...arr]);


const reduceSum = arr => () => arr.reduce((p, c) => p.add(c), new Decimal(0));

const forSum = arr => () => {
  let s = new Decimal(0);

  for (let i = 0; i < arr.length; i++) {
    s = s.add(arr[i]);
  }

  return s;
}

const forOfSum = arr => () => {
  let s = new Decimal(0);

  for (const item of arr) {
    s = s.add(item);
  }

  return s;
}

const limitov = new Array(100339).fill(0).map((_, i) => new Decimal(i));

try {
  console.log(mathSum(limitov)());
} catch (e) {
  console.log('caught')
}

bench
  .add("Decimal sum 65k with decims.REDUCE", reduceSum(limit))
  .add("Decimal sum 65k with FOR (CONST dec of decims)", forOfSum(limit))
  .add("Decimal sum 65k with DECMIAL.SUM(..decims)", mathSum(limit))
  .add("Decimal sum 65k with DECMIAL.SUM.APPLY(Decimal, decims)", mathSumApply(limit))
  .add("Decimal sum 65k with FOR LOOP", forSum(limit));

await bench.run();

console.table(bench.table());
