$(document).ready(async function () {
    M.AutoInit();

    setFarmId()

    // Vul invoervelden bedrijf in met gekozen bedrijf
    const farm = await selectFarm();
    let advisor_sel = farm.advisor.map(x => x.advisor_id);

    // advisors
    const advisors_allowed = await lookupAdvisors(advisor_sel = advisor_sel);

    $('#save_farmchange').on('click', function (e) {
        updateFarm();
        window.location.href = "overzicht";
    });
    // Pas bedrijf aan op basis van user input
    $('#save_advisors').on('click', async function (e) {
        await allowAdvisors(advisors_allowed);
    });

    $('#change_farm').on('click', function (e) {
        $("#changefarm_modal").modal("open");
    });

    $('#bedrijfsnaam').append('<h5>' + farm.farm_name + ' delen met derden</h4>');

    // advisor check
    $('#switch_advisor').on('click', function () {
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
selectFarm = async function () {    

    const data = await axios({
        method: 'post',
        url: '/api_farm_sel',
        data: {
            farm_id: localStorage.farm_id
        }
    }).then(function (res) {

        if (res.data.success) {
            let data = res.data.data.data;
            // Successful response
            console.log('farm details request succesfull');
            $('#farm_name').val(data.farm_name);
            M.updateTextFields();
            return(data);

        } else {
            // Unsuccessful response
            console.log('Unsuccesfull request farm details');
            let text = 'Fout bij inladen farm details.';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });

    return(data);
};


// Update farm
updateFarm = function () {
    let data = {
        farm_name: $('#farm_name').val(),
        farm_id: localStorage.farm_id
    };
    axios({
        method: 'put',
        url: '/api_farm_update',
        data: data
    }).then(function (res) {
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

// Lookup advisors
lookupAdvisors = async function (advisors_sel) {

    const result = await axios({
        method: 'get',
        url: '/api_advisors_lookup'
    });

    if (result.data.status == 200) {
        const advisors_ava = result.data.data.advisors;
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

    const old_sel = advisors_allowed;
    const new_sel = $('#advisor_selected').val();
    let error = false;

    // Disallow the advisors not selected anymore
    old_sel.forEach(async adv => {

        if (!new_sel.includes(adv)) {
            const data = {
                advisor_id: adv,
                farm_id: localStorage.farm_id
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
                advisor_id: adv,
                farm_id: localStorage.farm_id
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