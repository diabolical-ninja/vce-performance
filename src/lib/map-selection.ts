import type { CircleMarker, Map as LeafletMap } from "leaflet";

export function highlightSchool(
  map: LeafletMap,
  markers: Map<string, CircleMarker>,
  selected: string,
): void {
  const selectedWeight = 3;
  markers.forEach((marker, id): void => {
    marker.setStyle({
      weight: id === selected ? selectedWeight : 1,
      color: id === selected ? "#193C69" : "#FFFFFF",
    });
    if (id === selected) {
      marker.bringToFront();
      map.panInside(marker.getLatLng(), { animate: false });
    }
  });
}
