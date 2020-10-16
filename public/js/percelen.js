$(document).ready(async function () {

  // Initialize Materialize CSS
  M.AutoInit();

  setFarmId()

  // map setup for fixed location and low zoom
  let map = setupMap();

  // get locations from fields for the farm
  let farm_fields = await axios({
    method: "post",
    url: "/api_spatial_fields",
    data: {
      farm_id: localStorage.farm_id
    }
  });
  let farm_geo = farm_fields.data.data;

  let farmLayer = null;
  if (farm_geo.features == null) { // Check if farm has fields otherwise use empty layer
    farmLayer = new L.GeoJSON();
  } else {
    farmLayer = new L.GeoJSON(farm_geo, {
      style: { fillColor: "#FF0000", fillOpacity: 0.8, weight: 0.5 },
      onEachFeature: function (feature, layer) {
        layer.bindTooltip(feature.properties.fld_name, {
          permanent: false,
          direction: "center",
          className: "countryLabel"
        });
      }
    });

    // Switch map view to boudning box of farm
    let farm_bbox = farmLayer.getBounds();
    map.fitBounds(farm_bbox);
  }

  // Create BRP layer
  let brpLayer = new L.GeoJSON();
  await updateBRP(map, brpLayer, farmLayer, farm_geo);

  // update BRP at moving 
  map.on("moveend", function () {
    updateBRP(map, brpLayer, farmLayer, farm_geo);
  });

  // if click on field => open modal om field toe te voegen
  brpLayer.on("click", function (e) {
    let ref_id = e.sourceTarget.feature.properties.ref_id;
    modalAdd(ref_id);
  });
  // if click on field => open modal om field toe te voegen
  farmLayer.on("click", function (e) {
    let field_id = e.sourceTarget.feature.properties.fld_id;
    modalDel(field_id);
  });

  // voeg calender toe aan navbar
  $('#navbar').append('<ul class="right"> <li><a id="to_farm" href="farm" class="waves-effect waves-light btn">Terug naar bedrijf <i class="material-icons left">home_work</i></a></li></ul>')

});


// Setup base OSM leaflet map, with setview on Utrecht 
function setupMap() {
  let map = L.map("map", {
    maxZoom: 20,
    minZoom: 6,
    zoomControl: false
  }).setView([52.0907, 5.1214], 8);
  L.tileLayer("https://b.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "basemap"
  }).addTo(map);
  L.control
    .zoom({
      position: "bottomleft"
    })
    .addTo(map);

  return map;
}

// Get the brp fields and show them on the map
async function updateBRP(map, brpLayer, farmLayer, farm_geo) {

  const zoom = map.getZoom();
  const bbox = map.getBounds();
  const maxzoom = 12;

  if (zoom > maxzoom) {
    const geo_brp = await axios({
      method: "post",
      url: "/api_brp",
      data: {
        xmax: bbox._northEast.lng,
        ymax: bbox._northEast.lat,
        xmin: bbox._southWest.lng,
        ymin: bbox._southWest.lat
      }
    });

    if (geo_brp.data.status == 200) {
      // Remove existing layers to avoid stacking of layers; do this also for farmLayer to have fields of farm always on top
      brpLayer.clearLayers();
      farmLayer.clearLayers();
      brpLayer.addData(geo_brp.data.data);
      map.addLayer(brpLayer);
      if (farm_geo.features != null) {
        farmLayer.addData(farm_geo);
        map.addLayer(farmLayer);
      }
    } else {
      M.toast({ html: 'Helaas is het niet gelukt de percelen in te laden' });
    }
  }
}

// Add modeladd for input
function modalAdd(ref_id) {
  // popup modal perceelinvoer
  $("#perceel_modal").modal("open");

  // zone invoer als check zones
  $("#use_zones").change(function () {
    if ($(this).prop("checked")) {
      $("#zones_check").removeClass("hide");
    } else {
      $("#zones_check").addClass("hide");
      $("#field_zones").val("");
      M.updateTextFields();
    }
  });

  $("#save_field").off().on("click", function (e) {
    let name = $("#field_name").val();
    let zone_count = $("#field_zones").val();

    if (zone_count > 10) {
      M.toast({ html: "Er kunnen niet meer dan 10 zones worden ingevuld." });
    } else {
      let field = {
        fld_name: name,
        fld_zone_count: zone_count,
        ref_id: ref_id,
        farm_id: localStorage.farm_id
      }
      // Add field with all zones to the database
      addField(field);

    }

  });
}

// Add a field and zones to database
addField = function (field) {

  axios({
    method: "post",
    url: "/api_field_add",
    data: field
  }).then(function (res) {
    if (res.data.success) {
      console.log("veld toevoegen succes");
      window.location.href = "percelen";
    } else {
      // Unsuccessful response
      console.log("veld toevoegen niet gelukt");
      M.toast({ html: "Fout bij toevoegen field" });
    }
  }).catch(function (err) {
    console.log(err);
  });
};

function modalDel(field_id) {
  $("#perceel_modal_remove").modal("open");
  $("#delete_field").on("click", function (e) {
    deleteField(field_id);
  });
}

// Delete field
deleteField = function (field_id) {
  axios({
    method: "post",
    url: "/api_field_del",
    data: {
      fld_id: field_id,
      farm_id: localStorage.farm_id
    }
  }).then(function (res) {
    console.log(res.data);
    if (res.data.success) {
      // Successful response
      console.log("delete field succesfull");
      window.location.href = "percelen";
    } else {
      // Unsuccessful response
      console.log("Unsuccesfull delete field");
      M.toast({ html: "Fout bij verwijderen field" });
    }
  }).catch(function (err) {
    console.log(err);
  });
};