<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { resolveTemplate } from "$lib/utils";

  import "leaflet/dist/leaflet.css";
  import "leaflet.markercluster/dist/MarkerCluster.css";
  import "leaflet.markercluster/dist/MarkerCluster.Default.css";

  export let height = "420px";
  export let view;
  export let data;
  export let popupTemplate;
  export let group = true;

  view = {
    position: [0, 0],
    zoom: 14,
    ...view,
  };

  let map;

  onMount(async () => {
    if (browser) {
      const L = await import("leaflet");
      const L1 = await import("leaflet.markercluster");

      const icon = L.icon({ iconUrl: "/maps/map-marker.png", iconSize: [32, 37], iconAnchor: [16, 37] });

      map = L.map("map").setView(view.position, view.zoom);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const markers = new L1.MarkerClusterGroup();
      for (let res of data || []) {
        if (res.long && res.lat) {
          const marker = L.marker([parseFloat(res.lat), parseFloat(res.long)], { icon: icon });
          if (popupTemplate) {
            marker.bindPopup(resolveTemplate(popupTemplate, res));
          }
          if (group) {
            markers.addLayer(marker);
          } else {
            marker.addTo(map);
          }
        }
      }
      map.addLayer(markers);
    }
  });
</script>

<div id="map" style="height: {height}" />
