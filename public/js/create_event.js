$(document).ready(async function () {
  M.AutoInit();

  // show correct form based on user choice
  $('#event_selected').on('change', function (e) {
    showFormEvent();
  });


  // global objects fields and zones
  let farm_select = await axios({
    method: 'get',
    url: '/api_farm_sel'
  });
  let farm = farm_select.data.data.data;

  let nature_select = await axios({
    method: 'get', url: '/api_nature_lookup'
  });
  let nature_list = nature_select.data.data.nature_measures;

  const fertilizers_manure = await axios({
    method: 'post',
    url: '/api_fertilizers_lookup',
    data: {
      fertilizer_type: 'manure'
    }
  });
  let fert_list_manure = fertilizers_manure.data.data;
  fillFertilizerSelect(fert_list_manure, type = "manure");

  const fertilizers_artificial = await axios({
    method: 'post',
    url: '/api_fertilizers_lookup',
    data: {
      fertilizer_type: 'artificial'
    }
  });
  let fert_list_artificial = fertilizers_artificial.data.data;
  fillFertilizerSelect(fert_list_artificial, type = "artificial");

  // fill field selection options with DB
  fillFieldSelect(farm);
  fillField2Select(farm);

  // fill natuurmaatregel lijst
  fillNatureSelect(nature_list);

  // write event to DB
  $('#save_maaien').off().on('click', function (e) {
    saveMowing();
  });

  $('#save_beweiden').off().on('click', function (e) {
    saveGrazing();
  });

  $('#save_bemesten_dierlijk').off().on('click', function (e) {
    saveFertilisation(type = "manure");
  });

  $('#save_bemesten_kunst').off().on('click', function (e) {
    saveFertilisation(type = "artificial");
  });

  $('#save_pesticide').off().on('click', function (e) {
    savePesticidation();
  });

  $('#save_nature').off().on('click', function (e) {
    saveNature();
  });

  $('#save_renewal').off().on('click', function (e) {
    saveRenewal();
  });

  $('#btn_select_all_zones').on('click', function (e) {
    selectAll(options = 'zones');
  });

  $('#btn_select_all_fields').on('click', function (e) {
    selectAll(options = 'fields');
  });


  // correct settings for datepickers 
  $('.datepicker').datepicker({
    firstDay: true,
    // format: 'ddd dd-mm-yyyy',
    format: 'yyyy-mm-dd',
    i18n: {
      months: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
      weekdays: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
      weekdaysShort: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
      weekdaysAbbrev: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
      cancel: 'Terug',
      clear: 'Annuleren'
    },
    autoClose: true,
    defaultDate: new Date(),
    setDefaultDate: true

  });

  // voeg calender toe aan navbar
  $('#navbar').append('<ul class="right"> <li><a id="to_calendar" href="calendar" class="waves-effect waves-light btn">Kalender <i class="material-icons left">line_style</i></a></li></ul>')

});



// fill field selection with DB
fillFieldSelect = function (farm) {

  farm.field.forEach(field => {

    if (field.zone.length == 1) {
      var options = "<option value='" + field.zone[0].zon_id + "'>" + field.fld_name + "</option>";
      $("#fields_selected").append(options);
    } else {
      field.zone.forEach(zone => {
        if (zone.zon_name != null) {
          var options = "<option value='" + zone.zon_id + "'>" + field.fld_name + " (" + zone.zon_name + ")" + "</option>";
          $("#fields_selected").append(options);
        }
      });
    };
  });
  $("#fields_selected").formSelect(); // reinitialize

};
// fill field2 selection with DB
fillField2Select = function (farm) {

  farm.field.forEach(field => {
    var options = "<option value='" + field.fld_id + "'>" + field.fld_name + "</option>";
    $("#fields_selected_fieldsonly").append(options);
  });
  $("#fields_selected_fieldsonly").formSelect(); // reinitialize

};
fillNatureSelect = function (nature_list) {
  nature_list.forEach(item => {
    var options = "<option value='" + item.lnm_id + "'>" + item.lnm_measure_nl + "</option>";
    $("#natuurmaatregel_select").append(options);
  });
  $("#natuurmaatregel_select").formSelect(); // reinitialize

};

fillFertilizerSelect = function (fert_list, type) {
  fert_list.fertilizers.forEach(item => {
    let options = "<option value='" + item.product_id + "'>" + item.productnaam + "</option>";
    if (item.product_id == "aa83aa3deb90f3cd") {
      options = "<option value='" + item.product_id + "' selected>" + item.productnaam + "</option>";
    }
    if (type == "manure") {
      $("#mestsoort_dierlijk").append(options);
    } else if (type == "artificial") {
      $("#mestsoort_kunst").append(options);
    }

  });
  $('select').formSelect(); // reinitialize

};

// write user event mowing to DB
saveMowing = function () {

  let zones = $('#fields_selected').val();
  if (zones.length == 0) {
    M.toast({ html: 'Selecteer een zone om maaien toe te voegen' });
  } else {
    zones.forEach(zone => {
      let data = {
        zon_id: zone,
        date: $('#maaidatum').val()
      };
      axios({
        method: "post",
        url: "/api_mowing_add",
        data: data
      })
        .then(function (res) {
          console.log(res.data);
          if (res.data.success) {
            console.log("addition mowing was succesfull");
            window.location.href = 'calendar';
          } else {
            console.log("Unsuccesfull adding mowing");
            let text = "Fout bij toevoegen maaien.";
            M.toast({ html: text });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }
};

// write user event beweiden to DB
saveGrazing = function () {

  let zones = $('#fields_selected').val();
  if (zones.length == 0) {
    M.toast({ html: 'Selecteer een zone om beweiding toe te voegen' });
  } else {
    zones.forEach(zone => {
      let data = {
        zon_id: zone,
        cattle_type: $('#diergroep').val(),
        cattle_count: $('#dieraantal').val(),
        date1: $('#wei_start').val(),
        date2: $('#wei_eind').val()
      };

      if (data.date2 < data.date1) {
        M.toast({ html: 'Datum einde weiden is eerder dan datum start weiden' });
      } else {
        axios({
          method: "post",
          url: "/api_grazing_add",
          data: data
        })
          .then(function (res) {
            console.log(res.data);
            if (res.data.success) {
              console.log("addition grazing was succesfull");
              window.location.href = 'calendar';
            } else {
              console.log("Unsuccesfull adding grazing");
              let text = "Fout bij toevoegen beweiden.";
              M.toast({ html: text });
            }
          })
          .catch(function (err) {
            console.log(err);
          });
      }

    });
  }
};
// write user event fertilization to DB
saveFertilisation = function (type) {

  let zones = $('#fields_selected').val();
  if (zones.length == 0) {
    M.toast({ html: 'Selecteer een zone om bemesting toe te voegen' });
  } else {

    zones.forEach(zone => {

      let data = {};
      if (type == "manure") {
        data.zone_id = zone;
        data.date = $('#datum_bemesten_dierlijk').val();
        data.amount = $('#hoeveelheid_dierlijk').val() * 1000; // Convert ton to kg
        data.prd_id = $('#mestsoort_dierlijk').val();
      } else if (type == "artificial") {
        data.zone_id = zone;
        data.date = $('#datum_bemesten_kunst').val();
        data.amount = $('#hoeveelheid_kunst').val();
        data.prd_id = $('#mestsoort_kunst').val();
      }

      axios({
        method: "post",
        url: "/api_fertilising_add",
        data: data
      })
        .then(function (res) {

          if (res.data.success) {
            console.log("addition fertilising was succesfull");
            window.location.href = 'calendar';
          } else {
            console.log("Unsuccesfull adding fertilising");
            let text = "Fout bij toevoegen fertilising.";
            M.toast({ html: text });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }
};

// write user event pesticidation to DB
savePesticidation = function () {

  let zones = $('#fields_selected').val();
  if (zones.length == 0) {
    M.toast({ html: 'Selecteer een zone om pesticidegebruik toe te voegen' });
  } else {
    zones.forEach(zone => {
      let data = {
        zone_id: zone,
        date: $('#datum_pesticide').val()
      };

      // console.log(data)
      axios({
        method: "post",
        url: "/api_pesticidation_add",
        data: data
      })
        .then(function (res) {

          if (res.data.success) {
            console.log("addition pesticidation was succesfull");
            window.location.href = 'calendar';
          } else {
            console.log("Unsuccesfull adding pesticidation");
            let text = "Fout bij toevoegen pesticidegebruik";
            M.toast({ html: text });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }

};
// write user event nature event to DB
saveNature = function () {

  let fields = $('#fields_selected_fieldsonly').val();
  if (fields.length == 0) {
    M.toast({ html: 'Selecteer een perceel om een beheermaatregel toe te voegen' });
  } else {

    fields.forEach(field => {
      let data = {
        field_id: field,
        nature_measure_id: $('#natuurmaatregel_select').val(),
        nature_measure_date: $('#datum_nature').val()
      };

      axios({
        method: "post",
        url: "/api_nature_add",
        data: data
      })
        .then(function (res) {

          if (res.data.success) {
            console.log("addition nature measure was succesfull");
            window.location.href = 'calendar';
          } else {
            console.log("Unsuccesfull adding nature measure ");
            let text = "Fout bij toevoegen beheermaatregel .";
            M.toast({ html: text });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }
};

saveRenewal = function () {

  let fields = $('#fields_selected_fieldsonly').val();
  if (fields.length == 0) {
    M.toast({ html: 'Selecteer een perceel om een graslandvernieuwing toe te voegen' });
  } else {

    fields.forEach(field => {
      let data = {
        field_id: field,
        renewal_date: $('#datum_renewal').val()
      };

      axios({
        method: "post",
        url: "/api_renewal_add",
        data: data
      })
        .then(function (res) {

          if (res.data.success) {
            console.log("addition grassland renewal was succesfull");
            window.location.href = 'calendar';
          } else {
            console.log("Unsuccesfull addinggrassland renewal");
            let text = "Fout bij toevoegen graslandvernieuwing .";
            M.toast({ html: text });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }
};

showFormEvent = function () {
  let event = $('#event_selected').val();
  if (event == 'maaien') {
    $("#form_percelen").removeClass('hide');
    $("#form_percelen_fieldsonly").addClass('hide');
    $('#form_mowing').removeClass('hide');
    $('#form_grazing').addClass('hide');
    $('#form_fertilisation_manure').addClass('hide');
    $('#form_fertilisation_artificial').addClass('hide');
    $('#form_natuurmaatregel').addClass('hide');
    $('#form_renewal').addClass('hide');
  } else if (event == 'beweiden') {
    $("#form_percelen").removeClass('hide');
    $("#form_percelen_fieldsonly").addClass('hide');
    $('#form_mowing').addClass('hide');
    $('#form_grazing').removeClass('hide');
    $('#form_fertilisation_manure').addClass('hide');
    $('#form_fertilisation_artificial').addClass('hide');
    $('#form_pesticidation').addClass('hide');
    $('#form_natuurmaatregel').addClass('hide');
    $('#form_renewal').addClass('hide');
  } else if (event == 'bemesten_dierlijk') {
    $("#form_percelen").removeClass('hide');
    $("#form_percelen_fieldsonly").addClass('hide');
    $('#form_mowing').addClass('hide');
    $('#form_grazing').addClass('hide');
    $('#form_fertilisation_manure').removeClass('hide');
    $('#form_fertilisation_artificial').addClass('hide');
    $('#form_pesticidation').addClass('hide');
    $('#form_natuurmaatregel').addClass('hide');
    $('#form_renewal').addClass('hide');
  } else if (event == 'bemesten_kunst') {
    $("#form_percelen").removeClass('hide');
    $("#form_percelen_fieldsonly").addClass('hide');
    $('#form_mowing').addClass('hide');
    $('#form_grazing').addClass('hide');
    $('#form_fertilisation_manure').addClass('hide');
    $('#form_fertilisation_artificial').removeClass('hide');
    $('#form_pesticidation').addClass('hide');
    $('#form_natuurmaatregel').addClass('hide');
    $('#form_renewal').addClass('hide');
  } else if (event == 'pesticidegebruik') {
    $("#form_percelen").removeClass('hide');
    $("#form_percelen_fieldsonly").addClass('hide');
    $('#form_mowing').addClass('hide');
    $('#form_grazing').addClass('hide');
    $('#form_fertilisation_manure').addClass('hide');
    $('#form_fertilisation_artificial').addClass('hide');
    $('#form_pesticidation').removeClass('hide');
    $('#form_natuurmaatregel').addClass('hide');
    $('#form_renewal').addClass('hide');
  } else if (event == 'natuurmaatregel') {
    $("#form_percelen_fieldsonly").removeClass('hide');
    $("#form_percelen").addClass('hide');
    $('#form_mowing').addClass('hide');
    $('#form_grazing').addClass('hide');
    $('#form_fertilisation_manure').addClass('hide');
    $('#form_fertilisation_artificial').addClass('hide');
    $('#form_pesticidation').addClass('hide');
    $('#form_natuurmaatregel').removeClass('hide');
    $('#form_renewal').addClass('hide');
  } else if (event == "graslandvernieuwing") {
    $("#form_percelen_fieldsonly").removeClass('hide');
    $("#form_percelen").addClass('hide');
    $('#form_mowing').addClass('hide');
    $('#form_grazing').addClass('hide');
    $('#form_fertilisation_manure').addClass('hide');
    $('#form_fertilisation_artificial').addClass('hide');
    $('#form_pesticidation').addClass('hide');
    $('#form_natuurmaatregel').addClass('hide');
    $('#form_renewal').removeClass('hide');
  }
};

// When clicking on the button 'selecteer alles' 
selectAll = function (options) {

  // Get the right div
  let div_select = null;
  if (options == "zones") {
    div_select = $('#fields_selected option');
  } else if (options == "fields") {
    div_select = $('#fields_selected_fieldsonly option');
  }

  // Enable all options
  div_select.prop('selected', true);

  // Disable default option
  $('[name="option_default"]').prop('selected', false);

  $('select').formSelect();

};
