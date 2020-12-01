const express = require('express');
const axios = require('axios');
const router = express.Router();

const base_url = process.env.API_URL;
const maintenance = process.env.MAINTENANCE;

renderOrRedirect = async function (req, res, page, public, advisor = false) {

    if (maintenance == 'true' & public == false) {
        page = 'maintenance'
        res.render('pages/' + page, { page: page });
    } else {

        const session = req.signedCookies.gras_session;

        if (session == undefined) {

            if (public) {
                // Public page and not logged in
                res.render('pages/' + page, { logged_in: false, page: page });
            } else {
                // Private page and not logged in
                res.clearCookie('gras_session');
                res.redirect('login');
            }
        } else {

            const check = await axios({
                method: 'get',
                url: base_url + 'user/' + session,
                headers: {
                    Authorization: 'Bearer ' + process.env.API_KEY
                }
            });

            if (check.status == 200) {
                // Public or private page and logged in
                res.render('pages/' + page, { logged_in: true, page: page, advisor: advisor });
            } else {

                if (public) {
                    // Public page and not logged in
                    res.render('pages/' + page, { logged_in: false, page: page, advisor: false });
                } else {
                    // Private page and not logged in
                    res.clearCookie('gras_session');
                    res.redirect('login');
                }
            }
        }
    }
};

checkMaintenance = function () {

    const maintenance = process.env.MAINTENANCE;
    console.log(maintenance);
}



// Render the homepage
router.get('/', function (req, res) {

    const page = 'index';
    const public = true;

    renderOrRedirect(req, res, page, public);
});

router.get('/index', function (req, res) {

    const page = 'index';
    const public = true;

    renderOrRedirect(req, res, page, public);
});

// Render login page
router.get('/login', async function (req, res) {

    if (maintenance == 'true') {
        const page = 'maintenance'
        res.render('pages/' + page, { page: page });
    } else {
        const session = req.signedCookies.gras_session;

        if (session == undefined) {
            res.clearCookie('gras_session');
            res.render('pages/login', { logged_in: false, page: 'login' });
        } else {
            // check session
            const check = await axios({
                method: 'get',
                url: base_url + 'user/' + session,
                headers: { Authorization: 'Bearer ' + process.env.API_KEY }
            });
            if (check.status == 200) {
                res.redirect('calendar');
            } else {
                res.clearCookie('gras_session');
                res.render('pages/login', { logged_in: false, page: 'login' });
            }
        }
    }


});

// Render registratie page
router.get('/register', async function (req, res) {

    if (maintenance == true) {
        const page = 'maintenance'
        res.render('pages/' + page, { page: page });
    } else {
        const session = req.signedCookies.gras_session;

        if (session == undefined) {
            res.clearCookie('gras_session');
            res.render('pages/register', { logged_in: false, page: 'register' });
        } else {
            // check session
            const check = await axios({
                method: 'get',
                url: base_url + 'user/' + session,
                headers: { Authorization: 'Bearer ' + process.env.API_KEY }
            });
            if (check.status == 200) {
                res.redirect('calendar');
            } else {
                res.clearCookie('gras_session');
                res.render('pages/register', { logged_in: false, page: 'register' });
            }
        }
    }
});

// Render farm details page
router.get('/farm', function (req, res) {
    const page = 'farm';
    const public = false;

    renderOrRedirect(req, res, page, public);
});

// Render create_event page
router.get('/create_event', function (req, res) {

    const page = 'create_event';
    const public = false;

    renderOrRedirect(req, res, page, public);
});

// Render percelen page
router.get('/percelen', function (req, res) {

    const page = 'percelen';
    const public = false;

    renderOrRedirect(req, res, page, public);
});

// Render calendar page
router.get('/calendar', function (req, res) {

    const page = 'calendar';
    const public = false;

    renderOrRedirect(req, res, page, public);
});

// Render percelen time table (als mobiel scherm)
router.get('/time_table', function (req, res) {

    const page = 'time_table';
    const public = false;

    renderOrRedirect(req, res, page, public);
});

// Render percelen overzicht
router.get('/overzicht', async function (req, res) {

    if (maintenance == true) {
        const page = 'maintenance'
        res.render('pages/' + page, { page: page });
    } else {
        const page = 'overzicht';
        const public = false;
        let advisor = false;

        // Check if user is advisor
        const session = req.signedCookies.gras_session;
        const check = await axios({
            method: 'get',
            url: base_url + 'advisor/',
            headers: {
                Session: session,
                Authorization: 'Bearer ' + process.env.API_KEY
            }
        });

        if (check.data.data.advisor) {
            // User is an advisor
            advisor = true;
        }

        renderOrRedirect(req, res, page, public, advisor = advisor);
    }

});

// Render pagina informatie GrasPlan
router.get('/info', function (req, res) {
    const page = 'info';
    const public = true;

    renderOrRedirect(req, res, page, public);
});

// Render pagina Privacyverklaring GrasPlan
router.get('/privacy', function (req, res) {

    const page = 'privacy';
    const public = true;

    renderOrRedirect(req, res, page, public);
});

// Render percelen overzicht
router.get('/advisor', async function (req, res) {

    if (maintenance == true) {
        const page = 'maintenance'
        res.render('pages/' + page, { page: page });
    } else {
        // Check if user is advisor
        const session = req.signedCookies.gras_session;
        const check = await axios({
            method: 'get',
            url: base_url + 'advisor/',
            headers: {
                Session: session,
                Authorization: 'Bearer ' + process.env.API_KEY
            }
        });

        if (check.data.data.advisor) {
            // User is an advisor
            const page = 'advisor';
            const public = false;

            renderOrRedirect(req, res, page, public, advisor = true);
        } else {
            // user is not an advisor
            res.redirect('index');
        }
    }

});

// Export the routing
module.exports = router;