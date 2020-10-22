$(document).ready(async function () {
  // Initialize Materialize CSS
  M.AutoInit();

  await setFarmId()

  // global objects fields and zones
  let farm_select = await axios({
    method: "post",
    url: "/api_farm_sel",
    data: {
      farm_id: localStorage.farm_id
    }
  });
  let farm = farm_select.data.data.data;

  let farm_name = farm_select.data.data.data.farm_name;
  $("#bedrijfsnaam").append("<h4>Bedrijfsoverzicht " + farm_name + "</h4>");

  // global object geo fields
  let geo_fields = await axios({
    method: "post",
    url: "/api_spatial_fields",
    data: {
      farm_id: localStorage.farm_id
    }
  });
  let field_polygones = geo_fields.data.data;

  // map setup
  let map = setupMap();
  let geojsonLayer = new L.GeoJSON(field_polygones, {
    style: { fillColor: "#FF0000", fillOpacity: 0.8, weight: 0.5 },
    onEachFeature: function (feature, layer) {
      layer.bindTooltip(feature.properties.fld_name, {
        permanent: false,
        direction: "center",
        className: "countryLabel"
      });
    }
  }).addTo(map);

  map.fitBounds(geojsonLayer.getBounds());

  make_fieldTable(farm);

  // voeg calender toe aan navbar
  $("#navbar").append(
    '<ul class="right"> <li><a id="to_calendar" href="calendar" class="waves-effect waves-light btn">Kalender <i class="material-icons left">line_style</i></a></li></ul>'
  );
});

// perceel table
async function make_fieldTable(farm) {
  var data = [];

  function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  }

  farm.field.forEach(fld => {
    data.push([
      fld.field_name,
      round(fld.field_area / 10000, 2),
      fld.zone.length,
      "<button> Verwijderen</button>",
      fld.field_id
    ]);
  });

  var table = $("#table").DataTable({
    scrollY: "20vh",
    scrollCollapse: true,
    paging: false,
    searching: false,
    info: false,
    data: data,
    // defaultContent: ,
    columns: [
      { title: "Perceel" },
      { title: "Hectare" },
      { title: "Aantal zones" },
      { title: "Aanpassen", width: "10%" }
    ]
  });

  $("#table tbody").on("click", "button", function () {
    var data = table.row($(this).parents("tr")).data();
    deleteField(data[4]);
    // window.location.href = "farm";
  });
  $("#table tbody").on("hover", "tr", function () {
    var data = table.row($(this).parents("tr")).data();
    // highlightField(data[4]);
    console.log("hover");
  });
}

// Setup base OSM leaflet map
function setupMap() {
  let map = L.map("map2", {
    maxZoom: 20,
    minZoom: 6,
    zoomControl: false
  }).setView([51.976, 5.611], 13);
  L.tileLayer("https://b.tile.openstreetmap.de/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
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

// Delete field
deleteField = function (field) {

  axios({
    method: "post",
    url: "/api_field_del",
    data: { 
      fld_id: field,
      farm_id: localStorage.farm_id
    }
  })
    .then(function (res) {

      if (res.data.success) {
        // Successful response
        console.log("delete field succesfull");
        window.location.href = "farm";
      } else {
        // Unsuccessful response
        console.log("Unsuccesfull delete field");
        let text = "Fout bij verwijderen field.";
        M.toast({ html: text });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
};
