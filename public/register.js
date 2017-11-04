$("#registration-form").on("submit", function(event) {
    console.log('hi');
    event.preventDefault();

    var data = {};
    $("#registration-form").serializeArray().map(function(x) { data[x.name] = x.value; });
    $.ajax(({
        type: "POST",
        url: "/create_user",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) { alert(data); },
        failure: function(errMsg) {
            alert(errMsg);
        }
    }))
});