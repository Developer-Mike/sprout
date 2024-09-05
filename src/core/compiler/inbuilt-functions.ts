let isStopped = () => false

export function log(message: string) {
  console.log(message)
}

export async function sleep(ms: number) {
  await new Promise((resolve, reject) => {
    setTimeout(() => (
      isStopped() ? reject("Stopped") : resolve(null)
    ), ms)
  })
}