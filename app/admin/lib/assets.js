// Central map of admin dashboard asset URLs (served from /public/admin/assets).
const BASE = '/admin/assets'

export const AVATARS = [
  `${BASE}/avatars/avatar-01.svg`,
  `${BASE}/avatars/avatar-02.svg`,
  `${BASE}/avatars/avatar-03.svg`,
  `${BASE}/avatars/avatar-04.svg`,
  `${BASE}/avatars/avatar-05.svg`,
  `${BASE}/avatars/avatar-06.svg`,
]
export const AVATAR_FRAME = `${BASE}/avatars/avatar-frame.svg`

export const RANK_BADGE = {
  Cadet: `${BASE}/ranks/rank-1-cadet.svg`,
  Ensign: `${BASE}/ranks/rank-2-ensign.svg`,
  Lieutenant: `${BASE}/ranks/rank-3-lieutenant.svg`,
  Commander: `${BASE}/ranks/rank-4-commander.svg`,
  Captain: `${BASE}/ranks/rank-5-captain.svg`,
  Fleet: `${BASE}/ranks/rank-6-fleet.svg`,
}

export const STATUS_ICON = {
  not_called: `${BASE}/status/status-not-called.svg`,
  called: `${BASE}/status/status-called.svg`,
  no_answer: `${BASE}/status/status-no-answer.svg`,
  follow_up: `${BASE}/status/status-follow-up.svg`,
  booked: `${BASE}/status/status-booked.svg`,
  not_interested: `${BASE}/status/status-not-interested.svg`,
  disqualified: `${BASE}/status/status-disqualified.svg`,
}

// tier-1/2/3 map to the reviews service tiers starter/growth/pro (in order).
export const TIER_BADGE = {
  starter: `${BASE}/tiers/tier-1.svg`,
  growth: `${BASE}/tiers/tier-2.svg`,
  pro: `${BASE}/tiers/tier-3.svg`,
}

export const LCARS = {
  panelFrame: `${BASE}/lcars/panel-frame.svg`,
  panelElbow: `${BASE}/lcars/panel-elbow.svg`,
  segmentedBar: `${BASE}/lcars/segmented-bar.svg`,
  hudFrame: `${BASE}/lcars/hud-frame.svg`,
  headerBar: `${BASE}/lcars/header-bar.svg`,
  ruleLine: `${BASE}/lcars/rule-line.svg`,
}

export const CALL_BUTTON = `${BASE}/buttons/call-button.svg`
export const CALL_BUTTON_PRESSED = `${BASE}/buttons/call-button-pressed.svg`

export const XP = {
  chip: `${BASE}/xp/xp-chip.svg`,
  barFill: `${BASE}/xp/xp-bar-fill.svg`,
  barTrack: `${BASE}/xp/xp-bar-track.svg`,
  levelUpLottie: `${BASE}/xp/level-up-burst.json`,
  levelUpStatic: `${BASE}/xp/level-up-burst.svg`,
}

export const MISSION = {
  progressTrack: `${BASE}/mission/mission-progress-track.svg`,
  progressFill: `${BASE}/mission/mission-progress-fill.svg`,
  checkpoint: `${BASE}/mission/mission-checkpoint.svg`,
  completeLottie: `${BASE}/mission/mission-complete.json`,
  completeStatic: `${BASE}/mission/mission-complete.svg`,
}

export const CELEBRATION = {
  winLottie: `${BASE}/celebrations/win-booked.json`,
  winStatic: `${BASE}/celebrations/win-booked.svg`,
  pointsPop: `${BASE}/celebrations/points-pop.json`,
}

export const STATE_ART = {
  empty: `${BASE}/states/state-empty.svg`,
  loading: `${BASE}/states/state-loading.svg`,
  locked: `${BASE}/states/state-locked.svg`,
  completed: `${BASE}/states/state-completed.svg`,
}

export const TEXTURE = {
  grid: `${BASE}/textures/bg-grid.webp`,
  noise: `${BASE}/textures/bg-noise.webp`,
}
