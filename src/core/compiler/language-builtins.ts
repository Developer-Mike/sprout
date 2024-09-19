function log(message: string) {
  console.log(message)
}

async function sleep(ms: number) {
  await new Promise((resolve, reject) => {
    setTimeout(() => (
      // @ts-ignore isStopped is defined in the engine
      isStopped !== undefined && isStopped() ? reject("Stopped") : resolve(null)
    ), ms)
  })
}

export const LANGUAGE_BUILTINS = {
  log,
  sleep
}