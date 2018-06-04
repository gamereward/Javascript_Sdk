GrdUser=function(){
    this.username = '',
    this.email = '',
    this.address = '',
    this.balance = 0,
    this.token = '';
    this.otp = false;
};
GameReward = function (options) {
    const REWARD_TEST_URL = 'https://test.gamereward.io/appapi/';
    const REWARD_MAIN_URL = 'https://gamereward.io/appapi/';
    var opts = { 'net': 'TESTNET' };
    var serverUrl;
    var app_id='';
    var api_secret='';
    var reward = this;
    this.User = null;
    initInstance();
    function setCookie(cname, cvalue, exsec) {
        var d = new Date();
        d.setTime(d.getTime() + (exsec * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    function initInstance() {
        var st = "";
        if (window.sessionStorage) {
            st = window.sessionStorage.getItem("GRD_INSTANCE");
        }
        else {
            st =  getCookie('GRD_INSTANCE');
        }
        if (st && st.length > 0) {
            var data=JSON.parse(st);
            reward.User = data.user;
            opts = data.opts;
        }
        else {
            reward.User = null;
        }
        for (var attrname in options) { opts[attrname] = options[attrname]; }
        app_id = opts['appid'];
        api_secret = opts['secret'];
        if (opts.net == 'MAINNET') {
            serverUrl = REWARD_MAIN_URL;
        }
        else {
            serverUrl = REWARD_TEST_URL;
        }
    }
    window.onbeforeunload = saveInstance;
    function saveInstance() {
        var st = JSON.stringify({ "user": reward.User, "opts": opts });
        if (window.sessionStorage) {
            window.sessionStorage.setItem("GRD_INSTANCE",st);
        }
        else {
            setCookie('GRD_INSTANCE', st, 20);
        }
        
    }
    function getRequestToken() {
        var t = Math.round(Math.round((new Date()).getTime() / 1000) / 15);
        var k = Math.floor(t % 20);
        var len = Math.floor(api_secret.length / 20);
        var str = api_secret.substr(k * len, len);
        str = md5(str + t) + "&t=" + t;
        return str;
    }
    function createRequest(method, params,callback)
    {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
        } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
        }
        var data = "api_id=" + app_id + "&api_key=" + getRequestToken();
        if (params) {
            for (var vname in params) {
                data = data + "&" + vname+"=" + params[vname];
            }
        }
        if (reward.User != null && reward.User.token!="") {
            data = data + "&token=" + reward.User.token;
        }
        xhr.open('POST', serverUrl + method, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.method = method;
        xhr.onreadystatechange = function (e) {
            var jobj;
            if (xhr.readyState == 4 && xhr.status == 200) {
                jobj=  JSON.parse(xhr.responseText);
            }
            else {
                jobj={'error':'200','message':'Server error!'}
            }
            callback(jobj);
        };
        xhr.send(data);
    }
    this.isLogged = function () {
        return this.User != null;
    }
    this.login = function (username, password,otp, callback) {
        createRequest('login', { 'username': username, 'password': md5(password), 'otp': otp }, function (result) {
            if (result.error == 0) {
                reward.User = new GrdUser();
                reward.User.username = username;
                reward.User.email = result.email;
                reward.User.address = result.address;
                reward.User.balance = parseFloat(result.balance);
                reward.User.token = result.token;
                if (result.otpoptions) {
                    reward.User.otp = result.otpoptions > 0;
                }
                else {
                    reward.User.otp = false;
                }
            }
            else {
                reward.User = null;
            }
            saveInstance();
            callback(result);
        });
    };
    this.logout = function (callback) {
        createRequest('logout', null, function (result) {
            if (window.sessionStorage) {
                window.sessionStorage.removeItem("GRD_INSTANCE");
            }
            else {
                setCookie('GRD_INSTANCE', '');
            }
            reward.User =null;
            callback(result);
        });
    };
    this.register = function (username, password,email,userdata, callback) {
        createRequest('createaccount', { 'username': username, 'password': md5(password), 'email': email, 'userdata': userdata }, function (result)
        {
            callback(result);
        });
    };
    this.requestResetPassword = function (email,  callback) {
        createRequest('requestresetpassword', { 'email': email }, function (result) {
            callback(result);
        });
    };
    this.resetPassword = function (token, password, callback) {
        createRequest('doresetpassword', { 'token': token,'password':md5(password) }, function (result) {
            callback(result);
        });
    };
    this.qrcodeAddress = function (callback) {
        createRequest('qrcode', { 'text': 'gamereward:' + this.User.address, 'type': '1' }, function (result) {
            callback(result);
        });
    };
    this.transfer = function (to,amount,otp, callback) {
        createRequest('transfer', { 'to': username, 'value': amount, 'otp': otp }, function (result) {
            if (result.error == 0) {
                reward.user.balance -= amount;
            }
            callback(result);
        });
    };
    this.getTransactionCount = function ( callback) {
        createRequest('counttransactions', { }, function (result) {
            if (result.error == 0) {
                reward.user.balance -= amount;
            }
            callback(result);
        });
    };
    this.getTransactions = function (start,count, callback) {
        createRequest('transactions', { 'start': start, 'count': count }, function (result) {
            callback(result);
        });
    };
    this.requestEnableOtp = function (callback) {
        createRequest('requestotp',null, function (result) {
            callback(result);
        });
    };
    this.enableOtp = function (enabled,otp,callback) {
        createRequest('enableotp', { "otpoptions": (enabled ? 1 : 0), "otp": otp }, function (result) {
            if (result.error == 0) {
                reward.User.otp = enabled;
            }
            callback(result);
        });
    };
    this.callserverscript = function (script, funcname,params, callback) {
        createRequest('callserverscript', { "script": script, "fn": funcname, "vars": JSON.stringify(params) }, function (result) {
            callback(result);
        });
    };
    this.getUserSessionData = function (store, keys, start, count, callback) {
        createRequest('getusersessiondata', { "store": store, "keys": keys, "start": start, "count": count }, function (result) {
            callback(result);
        });
    };
    this.getLeaderBoard = function (scoreType, start, count, callback) {
        createRequest('getleaderboard', { "scoretype": scoreType, "start": start, "count": count }, function (result) {
            callback(result);
        });
    };
};