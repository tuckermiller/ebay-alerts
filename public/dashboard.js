$(document).ready(function() {
    $.ajax(({
        type: "GET",
        url: "/alerts",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            $('#user-title').innerText = data;
        },
        failure: function(errMsg) {
            alert(errMsg);
        }
    }))
})