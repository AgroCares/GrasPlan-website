$(document).ready(async function () {
  M.AutoInit();

  //  Define farm in global env
  let farm_select = await axios({
    method: 'get',
    url: '/api_farm_sel'
  });
  let fields = farm_select.data.data.data.field;

  // ga naar time table als klein scherm
  if (screen.width <= 700) {
    window.location.href = "time_table";
  } else {
    make_timeline(fields);
  }

  timeline_plotly.on('plotly_click', function (e) {

    let actie = e.points["0"].data;

    // voeg info to aan modal
    modalEvent(actie);

  });


  // voeg event toe aan navbar
  $('#navbar').append('<ul class="right"> <li><a id="to_actie" href="create_event" class="waves-effect waves-light btn">Actie toevoegen <i class="material-icons left">add</i></a></li></ul>')

});

modalEvent = function (actie) {

  $("#event_mod_head").empty();
  $('#modalcontent').empty();
  $('#modalcontent').append('<h5> ' + actie.actie + '</h5>');
  $('#modalcontent').append('<p>'+ actie.name +'</p>');
  $("#event_modal").modal("open");

  $("#delete_event").on("click", function (e) {
    let eventId = actie.id;
    let eventType = actie.actie;
    deleteEvent(eventType, eventId);
  });

};


deleteEvent = function (eventType, eventId) {

  // if grazing
  if (eventType == 'Beweiden') {

    axios({
      method: "post",
      url: "/api_grazing_delete",
      data: { eventId: eventId }
    })
      .then(function (res) {

        if (res.data.success) {
          // Successful response
          console.log("delete grazing succesfull");
          window.location.href = "calendar";

        } else {
          // Unsuccessful response
          console.log("Unsuccesfull delete grazing");
          let text = "Fout bij verwijderen weiden.";
          M.toast({ html: text });
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  } else if (eventType == 'Maaien') {
    axios({
      method: "post",
      url: "/api_mowing_delete",
      data: { eventId: eventId }
    })
      .then(function (res) {

        if (res.data.success) {
          // Successful response
          console.log("delete mowing succesfull");
          window.location.href = "calendar";

        } else {
          // Unsuccessful response
          console.log("Unsuccesfull delete mowing");
          let text = "Fout bij verwijderen maaien.";
          M.toast({ html: text });
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  } else if (eventType == 'Bemesten') {
    axios({
      method: "post",
      url: "/api_fertilising_delete",
      data: { eventId: eventId }
    })
      .then(function (res) {

        if (res.data.success) {
          // Successful response
          console.log("delete bemesten succesfull");
          window.location.href = "calendar";

        } else {
          // Unsuccessful response
          console.log("Unsuccesfull delete fertilizing");
          let text = "Fout bij verwijderen bemesten.";
          M.toast({ html: text });
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  } else if (eventType == 'Pesticidegebruik') {
    axios({
      method: "post",
      url: "/api_pesticidation_delete",
      data: { eventId: eventId }
    })
      .then(function (res) {

        if (res.data.success) {
          // Successful response
          console.log("delete pesticide succesfull");
          window.location.href = "calendar";

        } else {
          // Unsuccessful response
          console.log("Unsuccesfull delete api_pesticidation_delete");
          let text = "Fout bij verwijderen pesticidegebruik.";
          M.toast({ html: text });
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  } else if (eventType == 'Beheermaatregelen') {
    axios({
      method: "post",
      url: "/api_nature_measure_delete",
      data: { eventId: eventId }
    })
      .then(function (res) {

        if (res.data.success) {
          // Successful response
          console.log("delete nature measures succesfull");
          window.location.href = "calendar";

        } else {
          // Unsuccessful response
          console.log("Unsuccesfull delete api_nature_measures_delete");
          let text = "Fout bij verwijderen beheersmaatregel";
          M.toast({ html: text });
        }
      })
      .catch(function (err) {
        console.log(err);
      });

  } else if (eventType == 'Graslandvernieuwing') {
    axios({
      method: "post",
      url: "/api_grassland_renewal_delete",
      data: { eventId: eventId }
    })
      .then(function (res) {

        if (res.data.success) {
          // Successful response
          console.log("delete grassland renewal succesfull");
          window.location.href = "calendar";

        } else {
          // Unsuccessful response
          console.log("Unsuccesfull delete api_grassland_renewal_delete");
          let text = "Fout bij verwijderen graslandvernieuwing";
          M.toast({ html: text });
        }
      })
      .catch(function (err) {
        console.log(err);
      });

  } else {
    console.log("onbekende actie");
  }

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



make_timeline = function (fields) {
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
    // console.log(field.zone[0].zon_id)
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
    }
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
            x: [formatDate(item.mow_date, 0), formatDate(item.mow_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: '<b>Maaidatum:</b> '+ formatDate(item.mow_date, 0),
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
          if (item.lca_name_nl == null) {
            item.lca_name_nl = "Onbekend";
          }
          if (item.gra_count == null) {
            item.gra_count  = "Onbekend";
          }
          let x1 = formatDate(item.gra_end_date, 0)
          if (item.gra_end_date == item.gra_start_date) {
            x1 = formatDate(item.gra_end_date, 1);
          }
          actions.push({
            // actie: 'weiden',
            x0: formatDate(item.gra_start_date, 0),
            x1: x1,
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            fillcolor: color_weiden
          });
          data_plot.push({
            actie: 'Beweiden', // even voor de console
            id: item.gra_id,
            x: [formatDate(item.gra_start_date, 0), formatDate(item.gra_end_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: '<b>Begindatum beweiden:</b> '+ formatDate(item.gra_start_date, 0) + '<br><b>Einddatum beweiden:</b> '+ formatDate(item.gra_end_date, 0) +'<br><b>Diergroep:</b> '+ item.lca_name_nl +'<br><b>Aantal dieren:</b> '+ item.gra_count,
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
          if (item.prd_name == null) {
            item.prd_name  = "Onbekend";
          }
          if (item.fer_amount == null) {
            item.fer_amount = "Onbekend";
          }
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
            x: [formatDate(item.fer_date, 0), formatDate(item.fer_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: '<b>Bemestingsdatum:</b> '+ formatDate(item.fer_date, 0) + '<br><b>Bemestingsproduct:</b> '+ item.prd_name + '<br><b>Bemestingshoeveelheid:</b> '+ item.fer_amount +' kg per hectare',
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
            x: [formatDate(item.pes_date, 0), formatDate(item.pes_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: '<b>Datum van pesticidegebruik:</b> '+ formatDate(item.pes_date, 0),
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
            x: [formatDate(item.nma_date, 0), formatDate(item.nma_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: '<b>Datum van beheermaatregel:</b> '+ formatDate(item.nma_date, 0) +'<br><b>Beheermaatregel:</b> '+ item.lnm_measure_nl,
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
            x0: formatDate(item.gre_date, 0),
            x1: formatDate(item.gre_date, 1),
            y0: zone_list.findIndex(x => x.id == zone.zon_id) - 0.4,
            y1: zone_list.findIndex(x => x.id == zone.zon_id) + 0.4,
            line: { width: 0 },
            // type: "rect",
            fillcolor: color_renewal
          });
          data_plot.push({
            actie: 'Graslandvernieuwing',
            id: item.nma_id,
            x: [formatDate(item.gre_date, 0), formatDate(item.gre_date, 0)],
            y: [zone_list.findIndex(x => x.id == zone.zon_id) - 0.4, zone_list.findIndex(x => x.id == zone.zon_id) + 0.4],
            perceel: zone_list.findIndex(x => x.id == zone.zon_id),
            marker: { "color": color_invisible },
            name: '<b>Datum van graslandvernieuwing:</b> '+ formatDate(item.gre_date, 0),
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
