const express = require('express');
const axios = require('axios');
const router = express.Router();

const base_url = process.env.API_URL;

// SESSION - Cookie settings
cookie_config = {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    signed: true, 
    httpOnly: true,
    sameSite: true,
    secure: false //Should be set to true in production
};

if (process.env.NODE_ENV == "production") {
    cookie_config.secure = true;
}

// USER

// USER - Login user 
router.post('/api_login', function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    axios({
        method: 'get',
        url: base_url + 'user',
        headers: {
            Email: email,
            Password: password,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        console.log('inlog succesvol');  
        res.cookie('gras_session', response.data.data.session_id, cookie_config); 
        res.send({ success: true, message: 'U bent ingelogd' });
    }).catch(err => {
        console.log('Fout bij inloggen '+ err);
        res.send({ success: false });
    });
});


// USER - Register
router.post('/api_register', async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const farm_name = req.body.farm_name;
    const farm_organic = req.body.farm_organic;
    const farm_sector = req.body.farm_sector;
    let success = false;

    const registration = await axios({
        method: 'post',
        url: base_url + 'user',
        headers: {
            Email: email,
            Password: password,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    });

    if (registration.data.status == 200) {
        const farm = await axios({
            method: 'post',
            url: base_url + 'farm',
            params: {
                farm_name: farm_name,
                farm_organic: farm_organic,
                farm_sector: farm_sector
            },
            headers: {
                Session: registration.data.data.session_id,
                Authorization: 'Bearer ' + process.env.API_KEY
            }
        });
        if (farm.data.status == 200) {
            success = true;
        }    
    }

    if (success) {
        res.cookie('gras_session', registration.data.data.session_id, cookie_config);
        console.log('registratie succesvol');   
        res.send({success: true, message: 'registratie succesvol', data: registration.data.data});
    } else {
        console.log('Fout bij registratie');
        res.send({success: false });
    }
});


// USER - Logout
router.post('/api_logout', function (req, res) {
    const session = req.signedCookies.gras_session;

    axios({
        method: 'delete',
        url: base_url + 'user/' + session,
        headers: {Authorization: 'Bearer ' + process.env.API_KEY}
    }).then(response => {
        console.log('logout succesvol');   
        res.clearCookie('gras_session');
        res.send({success: true, message: 'logout succesvol', data: response.data});
        console.log('logout succesvol');   
    }).catch(err => {
        console.log('Fout bij uitloggen: '+ err);
    });
});



// #FARM 
// FARM - GET Farm details
router.post('/api_farm_sel', function (req, res) {
    const farm_id = req.body.farm_id;
    const session = req.signedCookies.gras_session;

    axios({
        method: 'get',
        url: base_url + 'farm/' + farm_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY}
    }).then(response => {   
        res.send({ success: true, message: 'GET Farm details succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij inladen farm details: '+ err);
        res.send({ success: false });
    });
});

// FARM - UPDATE farm details
router.put('/api_farm_update', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_name = req.body.farm_name;
    const farm_id = req.body.farm_id;
    const farm_organic = req.body_farm_organic;
    const farm_sector = req.body.farm_sector;

    axios({
        method: 'put',
        url: base_url + 'farm/' + farm_id,
        params: {
            farm_name: farm_name,
            farm_organic: farm_organic,
            farm_sector: farm_sector
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({success: true, message: 'Update farm details succesvol'});
    }).catch(err => {
        console.log('Fout bij inladen farm details: '+ err);
        res.send({success: false });
    });
});

// FARM - ADD a farm
router.post('/api_farm_add', function (req, res) {
    const farm_name = req.body.farm_name;
    const session = req.signedCookies.gras_session;
    const farm_organic = req.body_farm_organic;
    const farm_sector = req.body.farm_sector;

    axios({
        method: 'post',
        url: base_url + 'farm',
        params: {
            farm_name: farm_name,
            farm_organic: farm_organic,
            farm_sector: farm_sector
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add farm succesvol'});
    }).catch(err => {
        console.log('Fout bij toevoegen farm: '+ err);
        res.send({ success: false });
    }); 
});

// FARM - List all farms of user
router.get('/api_farm_list', function (req, res) {
    const session = req.signedCookies.gras_session;

    axios({
        method: 'get',
        url: base_url + 'farm',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'farm list ingeladen', data: response.data });
    }).catch(err => {
        console.log('Fout bij getting farm list: '+ err);
        res.send({ success: false });
    });
});

// FARM - switch from farm
// router.put('/api_farm_switch', function (req, res) {
//     const frm_id = req.body.frm_id;
//     const session = req.signedCookies.gras_session;

//     axios({
//         method: 'put',
//         url: base_url + 'farm/switch?session_id='+session+'&frm_id='+frm_id,
//         headers: {Authorization: 'Bearer ' + process.env.API_KEY}
//     }).then(response => {   
//         res.send({ success: true, message: 'farm switch DB gelukt' });
//     }).catch(err => {
//         console.log('farm switch DB is helaas niet gelukt: '+ err);
//         res.send({ success: false});
//     });
// });

// FARM - Delete farm
router.post('/api_farm_del', function (req, res) {
    const farm_id = req.body.frm_id;
    const session = req.signedCookies.gras_session;

    axios({
        method: 'delete',
        url: base_url + 'farm/' + farm_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'farm deleted' });
    }).catch(err => {
        console.log('Fout bij verwijderen bedrijf'+ err);
        res.send({ success: false });
    });
});



// #FIELD
// FIELD - Add a field
router.post('/api_field_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_id = req.body.farm_id;
    const reference_id = req.body.ref_id;
    const field_name = req.body.fld_name;
    let zone_count = req.body.zone_count;
    const field_year = 2020;
    const crop_code = 265;

    if (zone_count == '') {
        zone_count = 1;
    }

    axios({
        method: 'post',
        url: base_url + 'farm/' + farm_id + '/field',
        params: {
            reference_id: reference_id,
            field_name: field_name,
            field_year: field_year,
            crop_code: crop_code,
            zone_count: zone_count
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add field succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij toevoegen veld: '+ err);
        res.send({ success: false });
    });
});

// FIELD - update a field
router.get('/api_field_update', function (req, res) {
    const session = req.signedCookies.gras_session;
    const field_id = req.body.field_id;
    const field_name = req.body.field_name;

    axios({
        method: 'put',
        url: base_url + 'field/' + field_id,
        params: {
            field_name: field_name
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send(response.data);
        res.send({ success: true, message: 'Update field details succesvol' });
    }).catch(err => {
        console.log('Fout bij inladen field details: '+ err);
        res.send({ success: false });
    });
});

// FIELD - List all fields
router.get('/api_field_list', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_id = req.body.farm_id;

    axios({
        method: 'get',
        url: base_url + 'farm/' + farm_id + '/field',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'field details ingeladen', data: response.data});
    }).catch(err => {
        console.log('Fout bij inladen field list: '+ err);
        res.send({ success: false });
    });
});

// FIELD - Select a field
router.post('/api_field_sel', function (req, res) {
    const session = req.signedCookies.gras_session;
    const field_id = req.body.fld_id;

    axios({
        method: 'get',
        url: base_url + 'field/' + field_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send(response.data);
        res.send({ success: true, message: 'GET field details succesvol' });
    }).catch(err => {
        console.log('Fout bij inladen field details: '+ err);
        res.send({ success: false });
    });
});

// FIELD - Delete a field
router.post('/api_field_del', function (req, res) {

    const session = req.signedCookies.gras_session;
    const field_id = req.body.fld_id;

    axios({
        method: 'delete',
        url: base_url + 'field/' + field_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'field details ingeladen' });
    }).catch(err => {
        console.log('Fout bij inladen field details: '+ err);
        res.send({ success: false });
    });
});


// #ZONE
router.post('/api_zone_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    let field_id = req.body.fld_id;
    let zone_name = req.body.zone_name;

    axios({
        method: 'post',
        url: base_url + 'field/' + field_id + '/zone',
        params: {
            zone_name: zone_name
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add zone succesvol!!!!!!!' });
    }).catch(err => {
        console.log('Fout bij toevoegen zones: '+ err);
        res.send({ success: false });
    });
});

// ZONE - List all zones
router.post('/api_zone_list', function (req, res) {
    const session = req.signedCookies.gras_session;
    const field_id = req.body.fld_id;

    axios({
        method: 'get',
        url: base_url + 'field/' + field_id + '/zone',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'list zone succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij list zones: '+ err);
        res.send({ success: false });
    });
});


// ZONE - Select a zone
router.post('/api_zone_sel', function (req, res) {
    const session = req.signedCookies.gras_session;
    const zone_id = req.body.zone_id;

    axios({
        method: 'get',
        url: base_url + 'zone/' + zone_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'select zone succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij select zone: '+ err);
        res.send({ success: false });
    });
});

// ZONE - Delete a zone

// #GRAZING
// GRAZING - Add grazing
router.post('/api_grazing_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    const zone_id = req.body.zon_id;
    const date1 = req.body.date1;
    const date2 = req.body.date2;
    const cattle_type = req.body.cattle_type;
    let cattle_count = req.body.cattle_count;
    
    if (cattle_count == '') {
        cattle_count = null;
    }
    
    axios({
        method: 'post',
        url: base_url + 'zone/'+ zone_id + '/grazing',
        params: {
            cattle_type: cattle_type,
            cattle_count: cattle_count,
            grazing_start_date: date1,
            grazing_end_date: date2
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add grazing succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij toevoegen grazing: '+ err);
        res.send({ success: false });
    });
});



// GRAZING - Update grazing
// GRAZING - List all grazings
// GRAZING - Select grazing
// GRAZING - Delete grazing
router.post('/api_grazing_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const grazing_id = req.body.eventId;

    axios({
        method: 'delete',
        url: base_url + 'grazing/' + grazing_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'grazing deleting succesful' });
    }).catch(err => {
        console.log('Fout bij deleting grazing event: '+ err    );
        res.send({ success: false });
    });
});

// #MOWING
// MOWING - Add a mowing event
router.post('/api_mowing_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    const zone_id = req.body.zon_id;
    const date = req.body.date;

    axios({
        method: 'post',
        url: base_url + 'zone/' + zone_id + '/mowing',
        params: {
            mowing_date: date
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add field succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij toevoegen veld: '+ err);
        res.send({ success: false });
    });
});


// MOWING - Update a mowing
// MOWING - List all mowings
// MOWING - Select a mowing
// MOWING - Delete a mowing
router.post('/api_mowing_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const mowing_id = req.body.eventId;

    axios({
        method: 'delete',
        url: base_url + 'mowing/' + mowing_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'mowing deleting succesful' });
    }).catch(err => {
        console.log('Fout bij deleting mowing event: '+ err    );
        res.send({ success: false });
    });
});

// #FERTILISATION
// FERTILISATION - Add a fertilisation
// MOWING - Add a mowing event
router.post('/api_fertilising_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    let zone_id = req.body.zone_id;
    let date = req.body.date;
    let prd_id = req.body.prd_id;
    let amount = req.body.amount;

    axios({
        method: 'post',
        url: base_url + 'zone/' + zone_id + '/fertilization',
        params: {
            fertilizer_id: prd_id,
            fertilization_date: date,
            fertilization_amount: amount
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add fertilizer event succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij toevoegen fertilizer event: '+ err.data);
        res.send({ success: false });
    });
});

// FERTILISATION - Update a fertilisation
// FERTILISATION - List all fertilisation
// FERTILISATION - Select a fertilisation
// FERTILISATION - Delete a fertilisation
router.post('/api_fertilising_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const fertilization_id = req.body.eventId;

    axios({
        method: 'delete',
        url: base_url + '/fertilization' + fertilization_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'mowing deleting succesful' });
    }).catch(err => {
        console.log('Fout bij deleting mowing event: '+ err    );
        res.send({ success: false });
    });
});



// #BESPUITING
// BESPUITING - Add a fertilisation
router.post('/api_pesticidation_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    const zone_id = req.body.zone_id;
    const date = req.body.date;
 
    axios({
        method: 'post',
        url: base_url + 'pesticidation/add?session_id=' + session + '&pesticidation_date='+ date + '&zone_id=' + zone_id,
        params: {
            pesticidation_date: date
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'Add pesticidation event succesvol', data: response.data});
    }).catch(err => {
        console.log('Fout bij toevoegen pesticidation event: '+ err.data);
        res.send({ success: false });
    });
});


// BESPUITING - Delete a BESPUITING
router.post('/api_pesticidation_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const pesticidation_id = req.body.eventId;

    axios({
        method: 'delete',
        url: base_url + 'pesticidation/' + pesticidation_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'pesticidation deleting succesful' });
    }).catch(err => {
        console.log('Fout bij deleting oesticidation event: '+ err    );
        res.send({ success: false });
    });
});

// Beheersmaatregel- Delete a Beheersmaatregel
router.post('/api_nature_measure_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const nature_management_id = req.body.eventId;

    axios({
        method: 'delete',
        url: base_url + 'nature_management/' + nature_management_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'nature management deleting succesful' });
    }).catch(err => {
        console.log('Fout bij deleting nature management event: '+ err    );
        res.send({ success: false });
    });
});

// Graslandvernieuwing- Delete a Graslandvernieuwing
router.post('/api_grassland_renewal_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const grassland_renewal_id = req.body.eventId;

    axios({
        method: 'delete',
        url: base_url + 'grassland_renewal/' + grassland_renewal_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {   
        res.send({ success: true, message: 'nature management deleting succesful' });
    }).catch(err => {
        console.log('Fout bij deleting grassland renewal event: '+ err    );
        res.send({ success: false });
    });
});

// #BRP  
// Get brp parcels from a certain extent
router.post('/api_brp', function (req, res) {
    const xmax = req.body.xmax;
    const ymax = req.body.ymax;
    const xmin  = req.body.xmin;
    const ymin = req.body.ymin;

    axios({
        method: 'get',
        url: base_url +'spatial/fields',
        params: {
            xmax: xmax,
            ymax: ymax,
            xmin: xmin,
            ymin: ymin
        },
        headers: {
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij BRP ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });

});

// Get farm parcels from a certain extent
router.post('/api_spatial_fields', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_id = req.body.farm_id;

    axios({
        method: 'get',
        url: base_url + 'farm/' + farm_id + '/spatial',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij geofields ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });

});

// Get list of advisors
router.get('/api_advisors_lookup', function (req, res) {
    const session = req.signedCookies.gras_session;

    axios({
        method: 'get',
        url: base_url + 'advisors',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij list advisors ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });

});

// Allow advisor access to farm
router.post('/api_advisor_allow', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_id = req.body.farm_id;
    const advisor_id = req.body.advisor_id;

    axios({
        method: 'post',
        url: base_url + 'farm/' + farm_id + '/advisor/' + advisor_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij allow advisor  '+ err);
        res.send({ success: false });
    });

});

// Disallow advisor access to farm
router.post('/api_advisor_disallow', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_id = req.body.farm_id;
    const advisor_id = req.body.advisor_id;

    axios({
        method: 'delete',
        url: base_url + 'farm/' + farm_id + '/advisor/' + advisor_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij disallow advisor '+ err);
        res.send({ success: false });
    });

});

router.get('/api_advisor_select', function (req, res) {
    const session = req.signedCookies.gras_session;

    axios({
        method: 'get',
        url: base_url + 'advisor',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij advisor select ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });
});

// Show farm to advisor
router.post('/api_advisor_farm', function (req, res) {
    const session = req.signedCookies.gras_session;
    const farm_id = req.body.farm_id;

    axios({
        method: 'get',
        url: base_url + 'farm/' + farm_id + '/advisor/',
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij advisor select ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });

});

router.post('/api_fertilizers_lookup', function (req, res) {
    const fertilizer_type = req.body.fertilizer_type;

    axios({
        method: 'get',
        url: base_url + 'fertilizers',
        params: {
            fertilizer_type: fertilizer_type
        },
        headers: {
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        //console.log(err);
        console.log('Error bij list fertilizers ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });
});

router.get('/api_nature_lookup', function (req, res) {

    axios({
        method: 'get',
        url: base_url + 'nature_measures',
        headers: {
            Authorization: 'Bearer ' + process.env.API_KEY
    }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij list nature ophalen van NMI-DB '+ err);
        res.send({ success: false });
    });

});

router.post('/api_nature_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    const params = req.body;
    const field_id = params.field_id;
    const nature_measure_date = params.nature_measure_date;
    const nature_measure_id = params.nature_measure_id;

    axios({
        method: 'post',
        url: base_url + 'field/' + field_id + '/nature_management',
        params: {
            nature_management_date: nature_measure_date,
            nature_measure_id: nature_measure_id
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij add nature management van NMI-DB '+ err);
        res.send({ success: false });
    });

});

router.post('/api_nature_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const params = req.body;
    const nature_management_id = params.nature_management_id;

    axios({
        method: 'delete',
        url: base_url + '/nature_management/' + nature_management_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send({ success: true, message: 'nature deleting succesful' });
    }).catch(err => {
        console.log('Error bij delete nature management van NMI-DB '+ err);
        res.send({ success: false });
    });
});

router.post('/api_renewal_add', function (req, res) {
    const session = req.signedCookies.gras_session;
    const params = req.body;
    const field_id = params.field_id;
    const renewal_date = params.renewal_date;

    axios({
        method: 'post',
        url: base_url + 'field/' + field_id + '/grassland_renewal',
        params: {
            grassland_renewal_date: renewal_date
        },
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send(response.data);
    }).catch(err => {
        console.log('Error bij add grassland renewal van NMI-DB '+ err);
        res.send({ success: false });
    });

});

router.post('/api_grassland_renewal_delete', function (req, res) {
    const session = req.signedCookies.gras_session;
    const params = req.body;
    const renewal_id = params.nature_management_id;

    axios({
        method: 'delete',
        url: base_url + 'grassland_renewal/' + renewal_id,
        headers: {
            Session: session,
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        res.send({ success: true, message: 'nature deleting succesful' });
    }).catch(err => {
        console.log('Error bij delete nature management van NMI-DB '+ err);
        res.send({ success: false });
    });
});

router.post('/api_session_farm', function (req, res) {
    const session = req.signedCookies.gras_session;

    axios({
        method: 'get',
        url: base_url + 'user/' + session + '/farm',
        headers: {
            Authorization: 'Bearer ' + process.env.API_KEY
        }
    }).then(response => {  
        //console.log(response.data)
        res.send({ success: true, message: 'farm_id request successfull', data: {farm_id: response.data.data.farm_id}});
    }).catch(err => {
        console.log(err);
        res.send({ success: false });
    });
});


// Export the routing
module.exports = router;