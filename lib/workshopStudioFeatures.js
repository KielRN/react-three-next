// Release gates intentionally cannot be enabled by environment variables, a
// browser flag or owner POST. These gates cover deployed learner flows; the
// separately authorized instructor SDK pilots do not activate learner access.
export function studioAccessEnabled() { return false }
export function studioProviderTransportEnabled() { return false }
export function studioReadiness() {
  return {
    accessEnabled: false,
    provisioningEnabled: false,
    providerSubmissionEnabled: false,
    nativePaymentBindingAccepted: false,
  }
}
