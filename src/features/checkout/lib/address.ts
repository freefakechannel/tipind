import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/min"
import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from "postcode-validator"
import type { SERVICED_COUNTRY } from "../types"

/** National numbers are read in the selected country; "+..." works anywhere. */
export function isValidPhone(value: string, country: SERVICED_COUNTRY) {
  try {
    return isValidPhoneNumber(value, country)
  } catch {
    return false
  }
}

export function formatPhone(value: string, country: SERVICED_COUNTRY) {
  try {
    return (
      parsePhoneNumberFromString(value, country)?.formatInternational() ?? value
    )
  } catch {
    return value
  }
}

/** False for countries without a known postal-code format (then it's optional). */
export function hasPostalSystem(country: SERVICED_COUNTRY) {
  try {
    return postcodeValidatorExistsForCountry(country)
  } catch {
    return false
  }
}

export function isValidPostal(value: string, country: SERVICED_COUNTRY) {
  try {
    return postcodeValidator(value, country)
  } catch {
    return false
  }
}
