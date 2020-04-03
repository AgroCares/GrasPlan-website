$(document).ready(async function () {
  M.AutoInit();

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

    btn_select = '<a id="sel_' + bedrijf.frm_id + '" name="btn_switch_bedrijf" class="waves-effect waves-light btn-small"><i class="material-icons left">check_circle</i>Selecteer</a>';

    if (!bedrijf.frm_name) {
      bedrijf.frm_name = 'Geen naam toegevoegd';
    }

    $('#tbl_bedrijf').append(
      '<tr>' +
      '<td>' + bedrijf.frm_name + ' ' + badge + '</td>' +
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
  $('#event_mod_head').append('<h5> Actie ' + actie.actie + '</h5>');
  $('#modalcontent').append('<p>Algemene info over event</p>');
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
  make_timeline(fields);

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
  var color_background = "#efebe9";

  // define zone list
  let zone_list = [];
  fields.forEach(field => {
    if (field.zone.length == 1) {
      let zone_info = {
        name: field.fld_name,
        id: field.zone[0].zon_id
      };
      zone_list.push(zone_info);
    } else {
      field.zone.forEach(zone => {
        if (zone.zon_name != null) {
          let zone_info = {
            name: field.fld_name + " (" + zone.zon_name + ")",
            id: zone.zon_id
          }
          zone_list.push(zone_info);
        }
      });
    };
  });

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
            x0: formatDate(item.mow_date, 0),
            x1: formatDate(item.mow_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_maaien
          });
          data_plot.push({
            actie: 'Maaien',
            id: item.mow_id,
            x: [formatDate(item.mow_date, 0), formatDate(item.mow_date, 1)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: "hier extra info over maaien",
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
          // console.log(zone.grazing)
          actions.push({
            // actie: 'weiden',
            x0: formatDate(item.gra_start_date, 0),
            x1: formatDate(item.gra_end_date, 0),
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            fillcolor: color_weiden
          });
          data_plot.push({
            actie: 'Beweiden', // even voor de console
            id: item.gra_id,
            x: [formatDate(item.gra_start_date, 0), formatDate(item.gra_end_date, 1)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: "hier extra info over beweiden ",
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
          actions.push({
            x0: formatDate(item.fer_date, 0),
            x1: formatDate(item.fer_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_bemesten
          });
          data_plot.push({
            actie: 'Bemesten',
            id: item.fer_id,
            x: [formatDate(item.fer_date, 0), formatDate(item.fer_date, 1)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: "hier extra info over maaien",
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
            x0: formatDate(item.pes_date, 0),
            x1: formatDate(item.pes_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_pesticide
          });
          data_plot.push({
            actie: 'Pesticidegebruik',
            id: item.pes_id,
            x: [formatDate(item.pes_date, 0), formatDate(item.pes_date, 1)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: "hier extra info over pesticide",
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
            x0: formatDate(item.nma_date, 0),
            x1: formatDate(item.nma_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_nature
          });
          data_plot.push({
            actie: 'Beheermaatregelen',
            id: item.nma_id,
            x: [formatDate(item.nma_date, 0), formatDate(item.nma_date, 1)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: "hier extra info over nature management",
            text: 'Beheermaatregelen',
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
        y0: zone_list.findIndex(x => x.id == zone.zon_id) + 1 - 0.4,
        y1: zone_list.findIndex(x => x.id == zone.zon_id) + 1 + 0.4,
        line: { width: 0 },
        type: "rect",
        opacity: 1,
        fillcolor: color_maaien
      });
      data_plot.push({
        actie: 'maaien',
        x: ['20-03-01', '20-03-01'],
        perceel: zone_list.findIndex(x => x.id == zone.zon_id) + 1,
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
      range: ['2020-02-20', '2020-10-10'],
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