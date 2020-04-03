$(document).ready(function () {

    // Send alert to IE users that OS Balans does not support their browser
    var ua = window.navigator.userAgent;
    var isIE = /MSIE|Trident/.test(ua);
    if (isIE == true) {
        M.toast({ html: 'Helaas, uw browser is sterk verouderd. Kies voor Firefox of Chrome om gebruik te kunnen maken van de OS Balans', displayLength: 1000000 });
    }

    $('#a_logout').on('click', function (e) {
        sendLogout();
    });
});

sendLogout = async function () {

    const response = await axios({
        method: 'post',
        url: '/api_logout'
    });

    if (response.status == 200) {
        // Successfull logout
        window.location.href = "index";
    } else {
        M.toast('Helaas is er wat fout gegaan bij uitloggen');
    }
};