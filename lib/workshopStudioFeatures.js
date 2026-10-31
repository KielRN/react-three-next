// Release gates intentionally cannot be enabled by environment variables, a
// browser flag or owner POST. No provider/learner access is authorized yet.
export function studioAccessEnabled() { return false }
export function studioReadiness() {
  return {
    accessEnabled: false,
    provisioningEnabled: false,
    providerSubmissionEnabled: false,
    nativePaymentBindingAccepted: false,
  }
}
