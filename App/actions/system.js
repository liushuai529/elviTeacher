export function updateLanguage(payload) {
  return {
    type: 'system/update_language',
    payload,
  }
}

export function test() {
  return {
    type: 'system/reset_language',
  }
}

export function updateRemoteLanguage(payload) {
  return {
    type: 'system/update_remote_language',
    payload,
  }
}