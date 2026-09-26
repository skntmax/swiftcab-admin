export function vehicleTypeImageSrc(vehicle) {
  if (!vehicle || typeof vehicle !== 'object') {
    return ''
  }
  const mapIcon = typeof vehicle.map_icon === 'string' ? vehicle.map_icon.trim() : ''
  if (mapIcon) {
    if (mapIcon.startsWith('http://') || mapIcon.startsWith('https://') || mapIcon.startsWith('/')) {
      return mapIcon
    }
    return `/brand/vehicles/${mapIcon}`
  }
  const file = typeof vehicle.map_icon_file === 'string' ? vehicle.map_icon_file.trim() : ''
  if (file) {
    return `/brand/vehicles/${file}`
  }
  return typeof vehicle.avatar === 'string' ? vehicle.avatar : ''
}

export function vehicleTypeLabel(type) {
  return String(type || '').replace(/([a-z])([A-Z])/g, '$1 $2')
}
