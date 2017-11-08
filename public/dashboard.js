$(document).ready(function() {
    $.ajax(({
        type: "GET",
        url: "/alerts",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            renderAlerts(data);
        },
        failure: function(errMsg) {
            alert(errMsg);
        }
    }))

    $("#create-alert-form").on("submit", function(event) {
        event.preventDefault();

        var data = {};
        $("#create-alert-form").serializeArray().map(function(x) { data[x.name] = x.value; });
        $.ajax(({
            type: "POST",
            url: "/create_alert",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                // To do: replace with visual indication of success
                // To do: on success, clear form
                console.log('Success')
            },
            failure: function(errMsg) {
                alert(errMsg);
            }
        }))
    });
})

function renderAlerts(alerts) {
    alerts.map((alert) => {
        $("my-alerts").append(
            "<li><span>" + alert.keywords + "</span><span>" + alert.frequency + "</span></li>"
        );
    })
}