$(document).ready(function () {

    // Initialize Materialize CSS
    M.AutoInit();

    $('#form_register').on('submit', function (e) {
        //console.log('we gaan registreren!!!')
        e.preventDefault();
        $('#btn_submit').addClass("disabled");
        $('#icon-loading').removeClass('hide');

        // Collect the data from the the form
        let data = {
            email: $('#email').val(),
            password: $('#password').val(),
            farm_name: $('#farmname').val()
        };
        axios({
            method: 'post',
            url: '/api_register',
            data: data
        }).then(function (res) {
            if (res.data.success) {
                // Successful response
                console.log('successfull register');
                window.location.href = "farm";
            } else {
                // Unsuccessful response
                console.log('unsuccessfull register');
                let text = 'Helaas, is er wat fout gegaan bij het registeren, probeer het later opnieuw';
                M.toast({ html: text });
            }
        }).catch(function (err) {
            console.log(err);
            M.toast({ html: "Helaas, de registratie is mislukt. Bent u een bestaande gebruiker: kies inloggen in plaats van registreren. Bent u een nieuwe gebruiker: probeer het later nog een keer of neem contact op met het NMI via info@grasplan.nl." })
        });
    });



});


