$(document).ready(async function () {
    M.AutoInit();

    // Vul invoervelden bedrijf in met gekozen bedrijf
    selectFarm();

    // user_farms
    const farm_list = await axios({
        method: 'get',
        url: '/api_farm_list'
    });
    let user_farms = farm_list.data.data.data;

    fillFarmTable(user_farms);

    // advisors
    const advisors_allowed = await lookupAdvisors();

    // list farms voor invoer select bedrijven
    $('#save_farmnew').on('click', function (e) {
        addFarm();
    });
    $('#save_farmchange').on('click', function (e) {
        updateFarm();
        window.location.href = "overzicht";
    });
    // Pas bedrijf aan op basis van user input
    $('#save_advisors').on('click', async function (e) {
        await allowAdvisors(advisors_allowed);
    });

    $('#add_farm').on('click', function (e) {
        modalBedrijf();
    });

    $('#change_farm').on('click', function (e) {
        $("#changefarm_modal").modal("open");
    });

    // global objects fields and zones
    let farm_select = await axios({
        method: 'get',
        url: '/api_farm_sel'
    });
    let farm_name = farm_select.data.data.data.frm_name;

    $('#bedrijfsnaam').append('<h5>' + farm_name + ' delen met derden</h4>');

    // advisor check
    $('#switch_advisor').on('click', function () {
        console.log('clicked on checkbox advisor')
        if (this.checked) {
            $('#form_advisor').removeClass('hide');
        } else {
            $('#form_advisor').addClass('hide');
        }
    });


    // voeg calender toe aan navbar
    $('#navbar').append('<ul class="right"> <li><a id="to_calendar" href="calendar" class="waves-effect waves-light btn">Kalender <i class="material-icons left">line_style</i></a></li></ul>')



});

// View model function
async function modalBedrijf(field_ref_id, fieldLayer) {
    // popup modal perceelinvoer
    $("#bedrijf_modal").modal("open");

    M.updateTextFields();
};


// Get farm details
selectFarm = function () {

    let data = {};

    axios({
        method: 'get',
        url: '/api_farm_sel',
        data: data
    }).then(function (res) {

        // console.log(res.data);

        if (res.data.success) {
            let data = res.data.data.data;
            console.log(data)
            // Successful response
            console.log('farm details request succesfull');
            $('#farm_name').val(data.frm_name);
            M.updateTextFields();

        } else {
            // Unsuccessful response
            console.log('Unsuccesfull request farm details');
            let text = 'Fout bij inladen farm details.';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });
};


// Update farm
updateFarm = function () {
    let data = {
        farm_name: $('#farm_name').val()
    };
    console.log(data);
    axios({
        method: 'put',
        url: '/api_farm_update',
        data: data
    }).then(function (res) {
        console.log(res.data);
        if (res.data.success) {
            // Successful response
            console.log('Update farm details succesfull');
        } else {
            // Unsuccessful response
            console.log('Unsuccesfull update farm details');
            let text = 'Fout bij updaten bedrijf.';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });
};

// Add a farm
addFarm = function () {
    let data = {
        farm_name: $('#farm_name_add').val()
    };

    axios({
        method: 'post',
        url: '/api_farm_add',
        data: data
    }).then(function (res) {
        console.log(res.data);
        if (res.data.success) {
            // Successful response
            console.log('addition farm was succesfull');
            // location.reload();
            window.location.href = "overzicht";
        } else {
            // Unsuccessful response
            console.log('Unsuccesfull adding new farm');
            let text = 'Fout bij toevoegen bedrijf.';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });
};

// List all farms
fillFarmTable = function (user_farms) {

    console.log(user_farms);
    // Maak tabel bedrijven
    let frm_select = user_farms.farm_selected;

    // voor elk bedrijf: 
    $('#tbl_bedrijf').empty(); // tabel leegmaken

    user_farms.farms.forEach(bedrijf => {
        let badge = "";
        let btn_select = "";
        let btn_deleter = "";

        if (bedrijf.frm_id == frm_select) {
            badge = "<span class='new badge' data-badge-caption=''>Geselecteerd</span>";
        } else {
            btn_select = '<a id="sel_' + bedrijf.frm_id + '" name="btn_switch_bedrijf" class="waves-effect waves-light btn-small"><i class="material-icons left">check_circle</i>Selecteer</a>';
            btn_deleter = '<a id="del_' + bedrijf.frm_id + '" name="btn_del_bedrijf" class="waves-effect waves-light btn-small"><i class="material-icons left">delete_forever</i>Verwijder</a>';
        }
        if (!bedrijf.frm_name) {
            bedrijf.frm_name = 'Geen naam toegevoegd';
        }

        $('#tbl_bedrijf').append(
            '<tr>' +
            '<td>' + bedrijf.frm_name + ' ' + badge + '</td>' +
            //   '<td>' + bedrijf_created + '</td>' +
            '<td>' + btn_select + '</td>' +
            '<td>' + btn_deleter + '</td>' +
            '</tr>'
        );

    });


    $('[name="btn_switch_bedrijf"').on('click', function (e) {
        let farm_sel = e.target.id.substring("sel_".length);
        console.log('run switch farm');
        switchFarm(farm_sel);
    });

    $('[name="btn_del_bedrijf"').on('click', function (e) {
        let farm_sel = e.target.id.substring("del_".length);
        console.log('run remove farm ' + farm_sel);
        deleteFarm(farm_sel);
    });
};


// Switch farm
switchFarm = function (frm_sel) {
    let data = { frm_id: frm_sel };

    axios({
        method: 'put',
        url: '/api_farm_switch',
        data: data
    }).then(function (res) {
        console.log(res.data);
        if (res.data.success) {
            // Successful response
            console.log('switching farms succesfull');
            window.location.href = "overzicht";
        } else {
            // Unsuccessful response
            console.log('Unsuccesfull switching farms');
            let text = 'Fout bij wisselen bedrijf: de grasplan-app heeft geen toegang tot dit bedrijf.';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });
};

// Delete farm
deleteFarm = function (frm_sel) {
    let data = { frm_id: frm_sel };

    axios({
        method: 'post',
        url: '/api_farm_del',
        data: data
    }).then(function (res) {
        console.log(res.data);
        if (res.data.success) {
            // Successful response
            console.log('deleting farm succesfull');
            $('#tbl_bedrijf').remove();
            window.location.href = "overzicht";
        } else {
            // Unsuccessful response
            console.log('Unsuccesfull delte farm');
            let text = 'Fout bij verwijderen bedrijf';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });
};

// Lookup advisors
lookupAdvisors = async function () {

    const result = await axios({
        method: 'get',
        url: '/api_advisors_lookup'
    });
    console.log(result);

    if (result.data.status == 200) {
        const advisors_ava = result.data.data.available_advisors;
        const advisors_sel = result.data.data.selected_advisors;
        advisors_ava.forEach(advisor => {
            if (advisors_sel.includes(advisor.adv_id)) {
                $('#switch_advisor').prop('checked', true);
                $('#form_advisor').removeClass('hide');
                $('#advisor_selected').append('<option selected value="' + advisor.adv_id + '">' + advisor.adv_name + '</option>');
            } else {
                $('#advisor_selected').append('<option value="' + advisor.adv_id + '">' + advisor.adv_name + '</option>');
            }
        });
        $('select').formSelect();
        return advisors_sel;
    } else {
        console.log("lookup advisors unsuccessfull");
    }
};

// Allow advisors to farm
allowAdvisors = async function (advisors_allowed) {

    console.log(advisors_allowed);

    const old_sel = advisors_allowed;
    const new_sel = $('#advisor_selected').val();
    let error = false;

    // Disallow the advisors not selected anymore
    old_sel.forEach(async adv => {

        if (!new_sel.includes(adv)) {
            const data = {
                advisor_id: adv
            };
            const result = await axios({
                method: 'post',
                url: '/api_advisor_disallow',
                data: data
            });
            if (result.status != 200) {
                error = true;
            }

        }

    });

    // Allow advisors newly selected
    new_sel.forEach(async adv => {
        if (!old_sel.includes(adv)) {

            const data = {
                advisor_id: adv
            };
            const result = await axios({
                method: 'post',
                url: '/api_advisor_allow',
                data: data
            });
            if (result.status != 200) {
                error = true;
            }

        }
    });

    if (error) {
        M.toast({ html: "Helaas is het niet om delen met derden bij te werken" });
    } else {
        M.toast({ html: "Uw instellingen voor delen met derden zijn bijgewerkt" });
    }
};