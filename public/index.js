$("#login-form").on("submit", function(event) {
    event.preventDefault();

    var data = {};
    $("#login-form").serializeArray().map(function(x) { data[x.name] = x.value; });
    $.ajax(({
        type: "POST",
        url: "/login",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            window.location.href = "/dashboard"
        },
        failure: function(errMsg) {
            alert(errMsg);
        }
    }))
});