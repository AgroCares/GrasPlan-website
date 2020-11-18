$(document).ready(function () {

    // Initialize Materialize CSS
    M.AutoInit();


    $('#div_submit').append(
        '<button id="btn_submit" class="btn waves-effect waves-light" type="submit" name="action">' +
        'Log in<i class="material-icons right">send</i>' +
        '</button>'
    );

    $('#form_login').on('submit', function (e) {
        e.preventDefault();
        sendLogin();
    });

});


sendLogin = function () {
    // Change buttons
    $('#btn_submit').addClass("disabled");
    $('#password').addClass("disabled");
    $('#email').addClass("disabled");
    $('#icon-loading').removeClass('hide');


    // Collect the data from the the form
    let data = {
        email: $('#email').val(),
        password: $('#password').val()
    };
    // console.log(data);

    // Send data to the server
    axios({
        method: 'post',
        url: '/api_login',
        data: data
    }).then(function (res) {

        if (res.data.success) {
            // Successful response
            console.log('successfull login');
            localStorage.removeItem('farm_id');
            window.location.href = "calendar";
        } else {
            // Unsuccessful response
            console.log('unsuccessfull login');

            $('#btn_submit').removeClass("disabled");
            $('#password').removeClass("disabled");
            $('#email').removeClass("disabled");
            $('#icon-loading').addClass('hide');

            let text = 'Fout bij inloggen.';
            M.toast({ html: text });
        }

    }).catch(function (err) {
        console.log(err);
    });
};
