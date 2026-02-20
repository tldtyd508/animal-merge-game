// 사용자 고유 ID 관리 유틸리티

const USER_ID_KEY = 'animalGameUserId'
const USER_NICKNAME_KEY = 'animalGameUserNickname'

/**
 * 고유 사용자 ID 가져오기 (없으면 생성)
 */
export function getUserId() {
  try {
    let userId = localStorage.getItem(USER_ID_KEY)

    if (!userId) {
      // UUID 생성 (브라우저 지원)
      userId = crypto.randomUUID()
      localStorage.setItem(USER_ID_KEY, userId)
    }

    return userId
  } catch (error) {
    console.error('getUserId error:', error)
    // localStorage 실패 시 세션 기반 임시 ID
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 사용자 닉네임 가져오기
 */
export function getUserNickname() {
  try {
    return localStorage.getItem(USER_NICKNAME_KEY) || ''
  } catch (error) {
    console.error('getUserNickname error:', error)
    return ''
  }
}

/**
 * 사용자 닉네임 설정
 */
export function setUserNickname(nickname) {
  try {
    if (nickname && nickname.trim()) {
      localStorage.setItem(USER_NICKNAME_KEY, nickname.trim())
      return true
    }
    return false
  } catch (error) {
    console.error('setUserNickname error:', error)
    return false
  }
}

/**
 * 사용자 정보 가져오기
 */
export function getUserInfo() {
  return {
    userId: getUserId(),
    nickname: getUserNickname()
  }
}

/**
 * 사용자 ID 짧은 버전 (표시용)
 * 예: "a1b2c3d4-e5f6-..." → "a1b2c3d4"
 */
export function getShortUserId(userId = null) {
  const id = userId || getUserId()
  return id.split('-')[0]
}
