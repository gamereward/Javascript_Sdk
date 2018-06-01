GrdUser=function(){
    this.username = '',
    this.email = '',
    this.address = '',
    this.balance = 0,
    this.token = '';
};
GameReward = function (options) {
    const REWARD_TEST_URL = 'https://test.gamereward.com/appapi/';
    const REWARD_MAIN_URL = 'https://gamereward.com/appapi/';
    var opts = { 'net': 'TESTNET' };
    for (var attrname in options) { opts[attrname] = options[attrname]; }
    var serverUrl;
    var app_id = opts['appid'];
    var api_secret = opts['secret'];
    var reward=this;
    if (opts.net == 'MAINNET') {
        serverUrl = REWARD_MAIN_URL;
    }
    else {
        serverUrl = REWARD_TEST_URL;
    }
    function getRequestToken() {
        var t = Math.round(Math.round((new Date()).getTime() / 1000) / 15);
        var k = Math.floor(t % 20);
        var len = Math.floor(api_secret.length / 20);
        var str = api_secret.substr(k * len, len);
        str = md5(str + t);
        return str;
    }
    function createRequest(method, params,callback)
    {
        var xhr = new XMLHttpRequest();
        var data = "api_id=" + app_id + "&api_secret=" + getRequestToken();
        if (params) {
            for (var vname in params) {
                data = data + "&" + vname+"=" + params[vname];
            }
        }
        if (reward.User != null) {
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
    this.User = null;
    this.login = function (username, password, callback) {
        createRequest('login', { 'username': username, 'password':md5(password) }, function (result) {
            reward.User = new GrdUser();
            reward.User.username = result.username;
            reward.User.email = result.email;
            reward.User.address = result.address;
            reward.User.balance = parseFloat(result.balance);
            reward.User.token = result.token;
            callback(result);
        });
    };
    this.logout = function (callback) {
        createRequest('logout',null, function (result) {
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
    this.requestResetPassword = function (usernameOrEmail,  callback) {
        createRequest('requestresetpassword', { 'username': usernameOrEmail }, function (result) {
            callback(result);
        });
    };
};