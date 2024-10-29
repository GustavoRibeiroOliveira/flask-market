function createPlayPauseFinishButtons(){
        
    let workingMinutesInput = $("#working_time");
    workingMinutesInput.css({"display": "flex"});
    workingMinutesInput.append(`<div id=working-minutes-buttons
                        style="
                            display:flex; 
                            align-items: center; 
                            ">
                        <i id=play-button
                            style="
                                color: #2AC304;
                                cursor: pointer; 
                                " 
                            class="fa fa-play 
                                ows-tool-icon">
                        </i>
                        <i id=pause-button
                            style="
                                color: red;
                                cursor: pointer; 
                                " 
                            class="fa fa-pause 
                                ows-tool-icon">
                        </i>
                        <i id=finish-button
                            style="
                                color: #2AC304;
                                cursor: pointer; 
                                " 
                            class="fa fa-check-circle
                                ows-tool-icon">
                        </i>
                    </div>`);
}

function changeStatus(status){
    S("status").setValue(status)
}

function setVisibilityPlayPauseFinishButtonsAndChangeStatus(status, statusNameAndIdDict){
    
    const playButton = $("#play-button");
    const pauseButton = $("#pause-button");
    const finishButton = $("#finish-button");

    changeStatus(statusNameAndIdDict[status])
    
    switch (status) {
        case "To Do":
            playButton.css({ "display": "block" });
            pauseButton.css({ "display": "none" });
            finishButton.css({ "display": "none" });
            break;
        case "In Progress":
            playButton.css({ "display": "none" });
            pauseButton.css({ "display": "block" });
            finishButton.css({ "display": "block" });
            break;
        case "Paused":
            playButton.css({ "display": "block" });
            pauseButton.css({ "display": "none" });
            finishButton.css({ "display": "none" });
            break;
        case "Tester Review":
            playButton.css({ "display": "none" });
            pauseButton.css({ "display": "none" });
            finishButton.css({ "display": "none" });
            break;
        case "QA Review":
            playButton.css({ "display": "none" });
            pauseButton.css({ "display": "none" });
            finishButton.css({ "display": "none" });
            break;
        default:
            playButton.css({ "display": "none" });
            pauseButton.css({ "display": "none" });
            finishButton.css({ "display": "none" });
            break;
    }
}

function getstatusNameAndIdDict(){
    MessageProcessor.process({
        serviceId:
            "/adc-service/web/rest/v1/services/BRSC_System/Settings/settings_status_query_statuses_from_page_field",
        data: {
            field: "status",
            page: "tickets_board_form_page"
        },
        success ({ results }){
            statusNameAndIdDict = {};
            results.forEach((status) => {
                if(status.name == "To Do" || status.name == "In Progress" || status.name == "Paused" || status.name == "Tester Review" || status.name == "QA Review"){
                    statusNameAndIdDict[status.name] = status.status_id;
                    statusNameAndIdDict[status.status_id] = status.name;
                }
            })
            return statusNameAndIdDict;
        },
    });
}


function addFunctionalityToPlayPauseFinishButtons(){

    const statusNameAndIdDict = getstatusNameAndIdDict();
    let startTime = '';

    playButton.on("click", () => {
        if (S("start_date").getValue() == "") {
            S("start_date").setTime(new Date().toISOString());
        }

        startTime = new Date().getTime();
        S("start_time").setValue(startTime);

        setVisibilityPlayPauseFinishButtons("In Progress", statusNameAndIdDict);
    })

    pauseButton.on("click", () => {       
        const spentMinutes = (new Date().getTime() - startTime) / 60000;
        const workingMinutes = parseInt(S("working_time").getValue() || 0) + parseInt(spentMinutes);
        S("working_time").setValue(workingMinutes);

        setVisibilityPlayPauseFinishButtons("Paused", statusNameAndIdDict);
    })

    finishButton.on("click", () => {
        const finishTime = new Date().getTime();
        const startTime = S("start_time").getValue();
        
        /* 60000 = 60 segundos * 1000 milésimos = 1 minuto */
        const spentMinutes = (finishTime - startTime) / 60000;
        const workingMinutes = parseInt(S("working_time").getValue() || 0) + parseInt(spentMinutes);
        S("working_time").setValue(workingMinutes);

        setVisibilityPlayPauseFinishButtons("Tester Review", statusNameAndIdDict);

        S("delivery_date").setValue(new Date(finishTime).toISOString());
    })
}

function checkIfCurrentUserIsDeveloper(){
    MessageProcessor.process({
        serviceId:
            "/adc-service/rest/v1/services/Brazilian_Resource_Planning_Committee/BRPC/brpc_users_get",
        data: {
            ows_id: username
        },
        success ({ result }){
            return result.team_role === "Developer"
        },
    });
}

function setReadOnlyBasedOnTeamRole(){
    if(checkIfCurrentUserIsDeveloper()){
        S("form_panel").readOnly(true);
    }
}

