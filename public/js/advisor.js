$(document).ready(async function () {
  M.AutoInit();

  await setFarmId()

  await fillFarmTable();

});

// List all farms
fillFarmTable = async function () {

  // user_farms
  const farm_list = await axios({
    method: 'get',
    url: '/api_advisor_select'
  });

  let adv_farms = farm_list.data.data;
  // Maak tabel bedrijven

  // voor elk bedrijf: 
  $('#tbl_bedrijf').empty(); // tabel leegmaken
  adv_farms.farms_advising.forEach(bedrijf => {

    let badge = "";
    let btn_select = "";

    btn_select = '<a id="sel_' + bedrijf.farm_id + '" name="btn_switch_bedrijf" class="waves-effect waves-light btn-small"><i class="material-icons left">check_circle</i>Selecteer</a>';

    if (!bedrijf.farm_name) {
      bedrijf.farm_name = 'Geen naam toegevoegd';
    }

    $('#tbl_bedrijf').append(
      '<tr>' +
      '<td>' + bedrijf.farm_name + ' ' + badge + '</td>' +
      '<td>' + btn_select + '</td>' +
      '</tr>'
    );

  });


  $('[name="btn_switch_bedrijf"').on('click', function (e) {
    let farm_sel = e.target.id.substring("sel_".length);
    showFarm(farm_sel);
  });
};

modalEvent = function (actie) {
  $("#event_mod_head").empty();
  $('#event_mod_head').append('<h5> ' + actie.actie + '</h5>');
  $('#modalcontent').append('<p>' + actie.name + '</p>');
  $("#event_modal").modal("open");

};

function formatDate(date, add) {
  let d = new Date(date);
  d.setDate(d.getDate() + add);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

function timestamp(str) {
  return new Date(str).getTime();
}

showFarm = async function (farm_sel) {

  let farm = await axios({
    method: 'post',
    url: '/api_advisor_farm',
    data: { farm_id: farm_sel }
  });
  let fields = farm.data.data.field;
  $('#name_sel_farm').text(farm.data.data.farm_name)
  make_timeline(fields);

  timeline_plotly.on('plotly_click', function (e) {

    let actie = e.points["0"].data;

    // voeg info to aan modal
    modalEvent(actie);

  });
};


make_timeline = function (fields) {

  // Empty div
  $('#timeline_plotly').empty();

  var container = document.getElementById("timeline_plotly");

  var color_maaien = "rgb(204, 0, 0)";
  var color_weiden = "rgb(0, 204, 0)";
  var color_bemesten = "rgb(102, 26, 0)";
  var color_pesticide = "rgb(255, 204, 0)";
  var color_invisible = "rgba(0,0,0,0)";
  var color_nature = "rgb(85, 205, 255)";
  var color_renewal = "#034d02";
  var color_background = "#efebe9";

  // define zone list
  let zone_list = [];
  fields.forEach(field => {
    if (field.zone.length == 1) {
      let zone_info = {
        name: field.field_name,
        id: field.zone[0].zone_id
      };
      zone_list.push(zone_info);
    } else {
      field.zone.forEach(zone => {
        if (zone.zone_name != null) {
          let zone_info = {
            name: field.field_name + " (" + zone.zone_name + ")",
            id: zone.zone_id
          }
          zone_list.push(zone_info);
        }
      });
    };
  });

  //Sort zone_list alphabetically
  zone_list.sort((a, b) => (a.color > b.color) ? 1 : -1);

  // Define data list with actions
  let actions = [];

  // set up legend
  let data_plot = [
    {
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_maaien, "width": 20 },
      mode: 'lines',
      name: 'Maaien',
      showlegend: true
    },
    {
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_weiden, "width": 20 },
      mode: 'lines',
      name: 'Weiden',
      showlegend: true
    },
    {
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_bemesten, "width": 20 },
      mode: 'lines',
      name: 'Bemesten',
      showlegend: true
    },
    {
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_pesticide, "width": 20 },
      mode: 'lines',
      name: 'Pesticidegebruik',
      showlegend: true
    },
    {
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_nature, "width": 20 },
      mode: 'lines',
      name: 'Beheermaatregel',
      showlegend: true
    },
    {
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_renewal, "width": 20 },
      mode: 'lines',
      name: 'Graslandvernieuwing',
      showlegend: true
    },
    { // overwrite colors with blank :D 
      x: ["2020-01-10", "2020-01-10"],
      perceel: 0,
      line: { "color": color_background, "width": 25 },
      mode: 'lines',
      showlegend: false
    },

  ];

  fields.forEach(field => {
    field.zone.forEach(zone => {
      // events for mowing
      if (zone.mowing.length > 0) {
        zone.mowing.forEach(item => {
          actions.push({
            x0: formatDate(item.mowing_date, 0),
            x1: formatDate(item.mowing_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zone_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zone_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_maaien
          });
          data_plot.push({
            actie: 'Maaien',
            id: item.mowing_id,
            x: [formatDate(item.mowing_date, 0), formatDate(item.mowing_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zone_id) - 0.4, zone_list.findIndex(x => x.id == zone.zone_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zone_id),
            marker: { "color": color_invisible },
            name: '<b>Maaidatum:</b> ' + formatDate(item.mowing_date, 0),
            text: 'Maaien',
            hoverinfo: "x+text",
            uid: "c2e171",
            showlegend: false
          });
        });
      }
      // events for grazing
      if (zone.grazing.length > 0) {
        zone.grazing.forEach(item => {
          if (item.cattle_type == null) {
            item.cattle_type = "Onbekend";
          }
          if (item.cattle_count == null) {
            item.cattle_count = "Onbekend";
          }
          let x1 = formatDate(item.grazing_end_date, 0)
          if (item.grazing_end_date == item.grazing_start_date) {
            x1 = formatDate(item.grazing_end_date, 1);
          }
          actions.push({
            // actie: 'weiden',
            x0: formatDate(item.grazing_start_date, 0),
            x1: x1,
            y0: zone_list.findIndex(x => x.id == zone.zone_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zone_id) + 0.4,
            line: { width: 0 },
            fillcolor: color_weiden
          });
          data_plot.push({
            actie: 'Beweiden', // even voor de console
            id: item.grazing_id,
            x: [formatDate(item.grazing_start_date, 0), formatDate(item.grazing_end_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zone_id) - 0.4, zone_list.findIndex(x => x.id == zone.zone_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zone_id),
            marker: { "color": color_invisible },
            name: '<b>Begindatum beweiden:</b> ' + formatDate(item.grazing_start_date, 0) + '<br><b>Einddatum beweiden:</b> ' + formatDate(item.grazing_end_date, 0) + '<br><b>Diergroep:</b> ' + item.cattle_type + '<br><b>Aantal dieren:</b> ' + item.cattle_count,
            text: 'Beweiden',
            hoverinfo: "x+text",
            uid: "c2e171",
            showlegend: false
          });
        });

      }
      // events for fertilizing 
      if (zone.fertilization.length > 0) {
        zone.fertilization.forEach(item => {
          if (item.fertilizer_name == null) {
            item.fertilizer_name = "Onbekend";
          }
          if (item.fertilization_amount == null) {
            item.fertilization_amount = "Onbekend";
          }
          actions.push({
            x0: formatDate(item.fertilization_date, 0),
            x1: formatDate(item.fertilization_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zone_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zone_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_bemesten
          });
          data_plot.push({
            actie: 'Bemesten',
            id: item.fertilization_id,
            x: [formatDate(item.fertilization_date, 0), formatDate(item.fertilization_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zone_id) - 0.4, zone_list.findIndex(x => x.id == zone.zone_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zone_id),
            marker: { "color": color_invisible },
            name: '<b>Bemestingsdatum:</b> ' + formatDate(item.fertilization_date, 0) + '<br><b>Bemestingsproduct:</b> ' + item.fertilizer_name + '<br><b>Bemestingshoeveelheid:</b> ' + item.fertilization_amount + ' kg per hectare',
            text: 'Bemesten',
            hoverinfo: "x+text",
            uid: "c2e171",
            showlegend: false
          });
        });
      }
      // events for pesticide 
      if (zone.pesticidation.length > 0) {
        zone.pesticidation.forEach(item => {
          actions.push({
            x0: formatDate(item.pesticidation_date, 0),
            x1: formatDate(item.pesticidation_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zone_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zone_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_pesticide
          });
          data_plot.push({
            actie: 'Pesticidegebruik',
            id: item.pesticidation_id,
            x: [formatDate(item.pesticidation_date, 0), formatDate(item.pesticidation_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zone_id) - 0.4, zone_list.findIndex(x => x.id == zone.zone_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zone_id),
            marker: { "color": color_invisible },
            name: '<b>Datum van pesticidegebruik:</b> ' + formatDate(item.pesticidation_date, 0),
            text: 'Pesticidegebruik',
            hoverinfo: "x+text",
            uid: "c2e171",
            showlegend: false
          });
        });
      }
      // Events for nature management
      if (field.nature_management.length > 0) {
        zone.nature_management = [];
        field.nature_management.forEach(item => {
          actions.push({
            x0: formatDate(item.nature_management_date, 0),
            x1: formatDate(item.nature_management_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zone_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zone_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_nature
          });
          data_plot.push({
            actie: 'Beheermaatregelen',
            id: item.nma_id,
            x: [formatDate(item.nature_management_date, 0), formatDate(item.nature_management_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zone_id) - 0.4, zone_list.findIndex(x => x.id == zone.zone_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zone_id),
            marker: { "color": color_invisible },
            name: '<b>Datum van beheermaatregel:</b> ' + formatDate(item.nature_management_date, 0) + '<br><b>Beheermaatregel:</b> ' + item.nature_measure_name,
            text: 'Beheermaatregelen',
            hoverinfo: "x+text",
            uid: "c2e171",
            showlegend: false
          });
        });
      }
      // Events for nature management
      if (field.grassland_renewal.length > 0) {
        zone.grassland_renewal = [];
        field.grassland_renewal.forEach(item => {
          actions.push({
            x0: formatDate(item.grassland_renewal_date, 0),
            x1: formatDate(item.grassland_renewal_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zone_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zone_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_renewal
          });
          data_plot.push({
            actie: 'Graslandvernieuwing',
            id: item.gre_id,
            x: [formatDate(item.grassland_renewal_date, 0), formatDate(item.grassland_renewal_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zone_id) - 0.4, zone_list.findIndex(x => x.id == zone.zone_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zone_id),
            marker: { "color": color_invisible },
            name: '<b>Datum van graslandvernieuwing:</b> ' + formatDate(item.grassland_renewal_date, 0),
            text: 'Graslandvernieuwing',
            hoverinfo: "x+text",
            uid: "c2e171",
            showlegend: false
          });
        });
      }
    });
  });

  // zone names to plot 
  let names = zone_list.map(item => item.name);

  // tijdelijk: voor elk veld sowieso 1 actie toevoegen met niets er in, anders komen niet alle velden in calender
  fields.forEach(field => {
    field.zone.forEach(zone => {
      actions.push({
        x0: '20-03-01',
        x1: '20-03-01',
        y0: zone_list.findIndex(x => x.id == zone.zone_id) + 1 - 0.4,
        y1: zone_list.findIndex(x => x.id == zone.zone_id) + 1 + 0.4,
        line: { width: 0 },
        type: "rect",
        opacity: 1,
        fillcolor: color_maaien
      });
      data_plot.push({
        actie: 'maaien',
        x: ['20-03-01', '20-03-01'],
        perceel: zone_list.findIndex(x => x.id == zone.zone_id) + 1,
        "marker": { "color": color_invisible },
        showlegend: false
      });
    });
  });



  // Layout of plotly
  var layout = {
    xaxis: {
      type: "date",
      side: "top",
      showgrid: true,
      gridcolor: "#bdbdbd",
      zeroline: false,
      tick0: '2020-01-01',
      // dtick: 86400000.0 * 7,
      tickformat: '%d/%m',
      // rangeselector: selectorOptions,
      // tickformatstops: ticks,
      // rangeslider: {range: ['2020-01-01', '2021-01-01']},
      range: ['2020-02-20', '2020-10-31'],
      fixedrange: true
    },
    yaxis: {
      showgrid: false,
      ticktext: names,
      tickvals: Array.from(Array(names.length).keys()),
      zeroline: false,
      fixedrange: true
      // autorange: true
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 150, r: 60, b: 50, t: 50, pad: -20 },
    height: (names.length + 3) * 35, // dynamic height (1 line = ca 50 pixels)
    shapes: actions,
    hovermode: "closest",
    hoverlabel: { bgcolor: "#FFF" },
    autosize: true,
    legend: { "orientation": "h", y: 0, font: { size: 18 } },
    font: { size: 14 }
  };


  var config = { responsive: true, displayModeBar: false };

  Plotly.newPlot("timeline_plotly", data_plot, layout, config);
};