export function toBoolean(stringValue, defaultValue = false) {
    if (stringValue === "true") { return true }
    if (stringValue === "false") { return false }
    return defaultValue;
}