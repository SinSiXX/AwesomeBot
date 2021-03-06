function doMaintainerSetup() {
    document.title = botData.username + " Maintainer Console";
    document.getElementById("botname").innerHTML = botData.username;
    document.getElementById("profilepic").src = botData.avatar;
    setFavicon(botData.avatar);
    configGame(true);
    
    switchUsage();
    $("#commandusage-body").collapse("show");
    switchServers();
    document.getElementById("servers-badge").innerHTML = botData.servers.length; 
    $("#servers-body").collapse("show");
    switchBotBlocked();
    $("#botblocked-body").collapse("show");
    switchProfiles();
    $("#files-body").collapse("show");
    $("#bigmessage-body").collapse("show");
    
    $("#loading-modal").modal("hide");
}

function configStatus(statstr) {
    document.getElementById("statusswitcher").value = statstr;
    config("status", statstr, function() {
        document.getElementById("statusswitcher").value = botData.status;
    });
}

function switchUsage() {
    $("#loading-modal").modal("show");
    
    var commandusage = ""
    if(botData.commandusage.length>0) {
        for(var i=botData.commandusage.length-1; i>=0; i--) {
            commandusage += botData.commandusage[i] + "<br>";
        }
        commandusage += "<i>Data since " + botData.statsage + "</i>";
    } else {
        commandusage = "<i>Nothing here</i>";
    }
    document.getElementById("commandusage-body").innerHTML = commandusage;

    $("#loading-modal").modal("hide");
}

function switchServers() {
    var servertablebody = "";
    for(var i=0; i<botData.servers.length; i++) {
        servertablebody += "<tr id=\"serverentry-" + botData.servers[i][2] + "\"><td><img class=\"profilepic\" width=25 src=\"" + botData.servers[i][0] + "\" class=\"img-responsive img-circle\" /></td><td>" + botData.servers[i][1] + "</td><td>" + botData.servers[i][2] + "</td><td>" + botData.servers[i][3] + "</td><td><button type=\"button\" id=\"serverentry-" + i + "-msg\" class=\"btn btn-primary btn-xs servermsg\">Message</button>&nbsp;<button type=\"button\" class=\"btn btn-warning btn-xs\" onclick=\"javascript:config('clearstats', this.parentNode.parentNode.id.substring(12), function(err) {if(!err) {switchUsage()}});\">Clear Stats</button>&nbsp;<button type=\"button\" class=\"btn btn-warning btn-xs\" onclick=\"javascript:config('resetconfigs', this.parentNode.parentNode.id.substring(12), function() {});\">Reset Configs</button>&nbsp;<button type=\"button\" class=\"btn btn-danger btn-xs\" onclick=\"javascript:removeServer(this.parentNode.parentNode.id)\">Leave</button></td></tr>";
    }
    
    $("#servertablebody").popover({
        html: true,
        title: function() {
            i = parseInt(this.id.substring(this.id.indexOf("-")+1, this.id.lastIndexOf("-")));
            return "<button type=\"button\" class=\"close\" id=\"serverentry-" + botData.servers[i][2] + "-popoverclose\" onclick=\"$('#" + this.id + "').popover('hide');\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Send Message</h4>";
        },
        content: function() {
            i = parseInt(this.id.substring(this.id.indexOf("-")+1, this.id.lastIndexOf("-")));
            return "<div class=\"input-group\"><input type=\"text\" id=\"" + botData.servers[i][2] + "-msgserver\" class=\"form-control\" placeholder=\"Message in markdown\" onkeydown=\"if(event.keyCode==13){sendMessage('" + botData.servers[i][2] + "', this.value, " + i + ");}\"><span class=\"input-group-addon btn btn-primary\" onclick=\"javascript:sendMessage('" + botData.servers[i][2] + "', document.getElementById('" + botData.servers[i][2] + "-msgserver').value, " + i + ");\">Send</span></div><script>document.getElementById(\"" + botData.servers[i][2] + "-msgserver\").parentNode.parentNode.parentNode.style.maxWidth = \"350px\";</script>";
        },
        selector: ".servermsg",
        placement: "bottom",
        container: "body",
        trigger: "click"
    });
    
    document.getElementById("servertablebody").innerHTML = servertablebody;
    document.getElementById("addserverlink").href = botData.oauthurl;
}

function sendMessage(svrid, msg, i) {
    if(msg) {
        $("#serverentry-" + i + "-msg").popover("hide");
        config("msgserver", [svrid, msg], function() {});
    }
}

function removeServer(svrid) {
    if(botData.servers.length==1) {
        richModal("Cannot leave only server");
    } else {
        config("rmserver", svrid.substring(12), function(err) {
            if(!err) {
                document.getElementById(svrid).parentNode.removeChild(document.getElementById(svrid));
            }
        });
    }
}

function switchBotBlocked() {
    document.getElementById("botblockedtable").style.display = "";
    
    var blacklist = [];
    var botblockedtablebody = "";
    for(var i=0; i<botData.botblocked.length; i++) {
        blacklist.push(botData.botblocked[i][2]);
        botblockedtablebody += "<tr id=\"botblockedentry-" + botData.botblocked[i][2] + "\"><td><img class=\"profilepic\" width=25 src=\"" + botData.botblocked[i][0] + "\" /></td><td>" + botData.botblocked[i][1] + "</td><td>" + botData.botblocked[i][2] + "</td><td><button type=\"button\" class=\"btn btn-danger btn-xs\" onclick=\"javascript:config('botblocked', this.parentNode.parentNode.id.substring(16), switchBotBlocked);\">Unblock</button></td></tr>";
    }
    document.getElementById("botblockedtablebody").innerHTML = botblockedtablebody;
    if(botData.botblocked.length==0) {
        document.getElementById("botblockedtable").style.display = "none";
    }
    
    filterMembers(blacklist, function(possibleBotBlocked) {
        var botblockedselector = "";
        for(var i=0; i<possibleBotBlocked.data.length; i++) {
            botblockedselector += "<option value=\"" + possibleBotBlocked.data[i][1] + "\">" + possibleBotBlocked.data[i][0] + "</option>";
        }
        $("#botblockedselector").html(botblockedselector).selectpicker("refresh");
    });
}

function configUsername() {
    if(!document.getElementById("botnameinput")) {
        document.getElementById("botname").innerHTML = "<div class=\"col-xs-8\"><input id=\"botnameinput\" class=\"form-control input-lg\" onkeydown=\"if(event.keyCode==13){config('username', this.value, configUsername)}else if(event.keyCode==27){configUsername()}\" value=\"" + botData.username + "\"></input></div>";
        document.getElementById("botname").onclick = "";
        document.getElementById("botnameinput").focus();
    } else {
        document.getElementById("botname").innerHTML = botData.username;
        document.getElementById("botname").onclick = configUsername;
    }
}

function configGame(remove) {
    if(!document.getElementById("botgameinput") && !remove) {
        document.getElementById("botgame").innerHTML = "<div class=\"col-xs-6\"><input id=\"botgameinput\" class=\"form-control\" onkeydown=\"if(event.keyCode==13){config('game', this.value, configGame)}else if(event.keyCode==27){configGame()}\" value=\"" + (botData.game || "") + "\"></input></div>";
        document.getElementById("botgame").onclick = "";
        document.getElementById("botgameinput").focus();
    } else {
        document.getElementById("botgame").innerHTML = botData.game ? ("<b>Playing</b> " + botData.game) : "<i>Not playing a game</i>";
        document.getElementById("botgame").onclick = function() {
            configGame()
        };
        if(botData.game) {
            document.getElementById("botgameremove").style.display = "";
        } else {
            document.getElementById("botgameremove").style.display = "none";
        }
        if(botData.defaultgame) {
            document.getElementById("botgamedefault").style.display = "none";
        } else {
            document.getElementById("botgamedefault").style.display = "";
        }
    }
}

function configAvatar() {
    if($('.popover-content').find("#profilepicinput").val()) {
        config("avatar", $('.popover-content').find("#profilepicinput").val(), function(err) {
            $("#profilepic").popover("hide");
            document.getElementById("profilepic").src = botData.avatar;
        });
    }
}

function getFile(name) {
    window.location.href = "file?auth=" + authtoken + "&type=" + name;
}

function switchProfiles() {
    filterMembers([], function(possibleProfiles) {
        var profilesselector = "";
        for(var i=0; i<possibleProfiles.data.length; i++) {
            profilesselector += "<option value=" + i + ">" + possibleProfiles.data[i][0] + "</option>";
        }
        $("#profilesselector").html(profilesselector).selectpicker("refresh");
    });
}

function configProfiles(i) {
    if(i) {
        document.getElementById("profilesinput").value = botData.members[parseInt(i)][2];
    } else {
        config("points", [botData.members[parseInt(document.getElementById("profilesselector").value)][1], document.getElementById("profilesinput").value], function() {});
    }
}

function newBigmessage() {
    if(document.getElementById("bigmessageinput").value) {
        config('message', document.getElementById("bigmessageinput").value, function(err) {
            if(!err) {
                document.getElementById("bigmessageinput").value = "";
            }
        });
    }
}