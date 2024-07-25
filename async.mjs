import { Bench } from "tinybench";

function createPromise(i) {
  return new Promise((res, rej) =>
    setTimeout(() => (i % 100 === 0 ? rej() : res()), 0),
  );
}
async function resolve(i) {
  return Promise.resolve(i);
}
async function tryCatch(i) {
  try {
    return await createPromise(i);
  } catch { }
}

async function waitAndGive(i) {
  return new Promise((res, rej) =>
    setTimeout(() => (i % 100 === 0 ? rej(i) : res()), 0),
  );
}

async function promiseCatchStrict(i) {
  return await createPromise(i).catch(() => { });
}
async function promiseCatchLazy(i) {
  return createPromise(i).catch(() => { });
}

function addOne(i) {
  return i + 1;
}

async function promiseThen(i) {
  return waitAndGive(i)
    .then(addOne)
    .then(waitAndGive)
    .then(addOne)
    .catch(() => { });
}

async function asyncNotThen(i) {
  try {
    const a = await waitAndGive(i);
    const b = addOne(a);
    const c = await waitAndGive(b);
    return addOne(c);
  } catch { }
}

const bench = new Bench({ time: 1000 });

const thousend = new Array(1000).fill(0).map((_, i) => i);

const aThousendPromises = async (f) => {
  await Promise.all(thousend.map(f));
};

bench
  .add("promise a thousend", async () => aThousendPromises(promiseThen))
  .add("async a thousend", async () => aThousendPromises(asyncNotThen))
  .add("async not then", async () => {
    await asyncNotThen(100);
  })
  .add("promise then", async () => {
    await promiseThen(100);
  })
  .add("promise lazy", async () => {
    await promiseCatchLazy(1);
  })
  .add("promise strict", async () => {
    await promiseCatchStrict(1);
  })
  .add("resolve", async () => {
    await resolve(1);
  })
  .add("resolve.then map", async () => {
    await resolve(1).then(addOne);
  })
  .add("resolve.then flatMap", async () => {
    await resolve(1).then(waitAndGive);
  })
  .add("try catch", async () => {
    await tryCatch(1);
  });

await bench.run();

console.table(bench.table());
