async function sendResponse(response: any, meta?: any): Promise<void> {
  // const urlParams = new URLSearchParams(window.location.search)
  // const id = urlParams.get('__id') ?? ''
  // const result = {
  //   __id: id,
  //   __type: 'response',
  //   result: response,
  //   meta,
  // }
  // await chrome.runtime.sendMessage(result)
}

async function sendError(error: any): Promise<void> {
  // const urlParams = new URLSearchParams(window.location.search)
  // const id = urlParams.get('__id') ?? ''
  // const result = {
  //   error,
  //   __id: id,
  //   __type: 'response'
  // }
  // await chrome.runtime.sendMessage(result)
}

export { sendResponse, sendError }
