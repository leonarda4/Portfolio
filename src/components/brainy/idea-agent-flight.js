// Four eased flight legs, each followed by one brief signature gesture.
// The travel clock advances 14.4s per loop, closing both body and eye cycles.
const TRAVEL = 4
const HOLD = 1.8
const RAMP = .4
const LEG = TRAVEL + HOLD
export const IDEA_AGENT_FLIGHT_DURATION = LEG * 4
const smooth = t => t * t * (3 - 2 * t)
const integral = t => t ** 3 - t ** 4 / 2

export function ideaAgentFlight(time, index) {
  const clock = ((time + index * .8) % IDEA_AGENT_FLIGHT_DURATION + IDEA_AGENT_FLIGHT_DURATION) % IDEA_AGENT_FLIGHT_DURATION
  const leg = Math.floor(clock / LEG)
  const local = clock - leg * LEG
  let distance
  if (local < RAMP) distance = RAMP * integral(local / RAMP)
  else if (local < TRAVEL - RAMP) distance = local - RAMP / 2
  else if (local < TRAVEL) distance = TRAVEL - RAMP - RAMP * integral((TRAVEL - local) / RAMP)
  else distance = TRAVEL - RAMP
  const travelTime = leg * (TRAVEL - RAMP) + distance
  const progress = Math.max(0, Math.min(1, (local - TRAVEL) / HOLD))
  const weight = local < TRAVEL ? 0 : smooth(Math.min(1, progress / .15, (1 - progress) / .15))
  return { time: travelTime, phase: travelTime * Math.PI / 7.2 + index * Math.PI / 4, emote: { progress, weight } }
}
