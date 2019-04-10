import sdp from 'sdp'

// PATCH IT!!!
const originalsdpSplitSections = sdp.splitSections
sdp.splitSections = blob => {
  if (blob) {
    return originalsdpSplitSections(blob)
  } else {
    return []
  }
}
