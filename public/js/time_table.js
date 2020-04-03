$(document).ready(function () {
    M.AutoInit();
    make_timetable();
});

make_timetable = function () {
    var data = [
        ['21/1/2020', 'Perceel 1', 'Bemesten - kunstmest'],
        ['Trident', 'Internet Explorer 5.0', 'Win 95+'],
        ['Trident', 'Internet Explorer 5.5', 'Win 95+'],
        ['Gecko', 'Camino 1.0', 'OSX.2+'],
        ['Gecko', 'Camino 1.5', 'OSX.3+'],
        ['Gecko', 'Netscape 7.2', 'Win 95+ / Mac OS 8.6-9.2'],
        ['Gecko', 'Netscape Browser 8', 'Win 98SE+'],
        ['Gecko', 'Netscape Navigator 9', 'Win 98+ / OSX.2+'],
        ['Misc', 'PSP browser', 'PSP'],
        ['Other browsers', 'All others', '-']
    ];

    $('#table').dataTable({
        scrollY: '50vh',
        scrollCollapse: true,
        paging: false,
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Zoek op perceel of actie",
            info: 'Gebruik de desktopversie voor de kalenderweergave'
        },
        "data": data,
        "columns": [
            { "title": "Datum" },
            { "title": "Perceel" },
            { "title": "Actie" }
        ]
    });

};
