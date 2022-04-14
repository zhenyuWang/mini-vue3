const queue:any[] = []
let isFlushPending = false
let currentFlushPromise

export function nextTick(fn){
  const p = currentFlushPromise ?? Promise.resolve()
  return fn?p.then(fn):p
}

export function queueJob(job){
  if(!queue.includes(job)){
    queue.push(job)
  }

  queueFlush()
}

function queueFlush(){
  if(isFlushPending) return
  isFlushPending = true
  currentFlushPromise = Promise.resolve().then(flushJob)
}

function flushJob(){
  isFlushPending = false
  let job
  while(job = queue.shift()){
    job?.()
  }
}