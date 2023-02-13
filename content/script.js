(function () {

	var id = "scw-63hsuwee8";
	var color = document.getElementById(id).getAttribute("data-color");
	var type = document.getElementById(id).getAttribute("data-widgettype");
    var loc = 'https://suitecall.com:8980/static/';
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    var hiddenGreeting = true;//mobileAndTabletcheck();
    link.rel = 'stylesheet';
    link.type = 'text/css';
	if (color == undefined || color == '') {
		link.href = loc + 'css/widget.css';
	} else {
		link.href = loc + 'css/widget-'+color+'.css';
	}

    link.media = 'all';
    head.appendChild(link);

    if (type == undefined || type == '') {
    	type = 0;
    }
    var body = document.getElementsByTagName('body')[0];
    var div = document.createElement('div');
    var positionClass = "scw-buttons-block";
    switch (document.getElementById(id).getAttribute("data-position")) {
		case 'left':
			positionClass = "scw-buttons-block-left";
			break;
		case 'right':
			positionClass = "scw-buttons-block-right";
			break;
		default:
			break;
	}

    var text = '<div class="'+positionClass+'">';
    posHint = "";
    if (type == 1) {
    	posHint = 'style="bottom: -200px;"';
    }
    text += '<div class="scw-hint hidden" id="scw-hint-greeting" '+posHint+'><div class="scw-hint-content">Здравствуйте! Будем рады вам помочь! </div></div>';
    if (type == 0 || type == 1) {
    	text += '<div class="scw-button scw-button-chat" id="scw-button-chat"><div class="scw-logo-status" id="scw-logo-status"></div><div class="scw-logo-unreads" id="scw-logo-unreads" style="display: none;"></div><div class="scw-logo"><img src="' + loc + 'img/chat1.png"></div></div>';
    }
    if (type == 0 || type == 2) {
    	text += '<div class="scw-button scw-button-phone" id="scw-button-phone"><div class="scw-logo"><img src="' + loc + 'img/phone1.png"></div></div>';
    }
    text += '</div>';
    text += '<div class="scw-window" id="scw-window-chat"><div class="scw-window-header"><div class="scw-window-status" id="scw-window-status"></div><div class="scw-button-close" id="scw-button-close">Закрыть окно<img src="' + loc + 'img/closerimg.png"></div></div><div class="scw-window-chat" id="scw-window-chat-block"></div><div class="scw-window-input"><form id="scw-input-chat-form"><input type="text" id="scw-input-chat" autocomplete="off" placeholder="Введите сообщение"><div class="scw-button-send" id="scw-input-chat-button"><img src="' + loc + 'img/send.png"></div></form></div></div>';
    text += '<div class="scw-window" id="scw-window-phone"><div class="scw-window-header"><div class="scw-button-close">Закрыть окнddо<img src="' + loc + 'img/closerimg.png"></div></div><div class="scw-window-top-text">Оставьте ваш номер телефона.<br> Наш менеджер вам перезвонит.</div><div class="scw-window-form"><form id="scw-input-phone-form"><div class="scw-window-input-name"><input type="text" id="scw-input-form-name" placeholder="Ваше имя" autocomplete="off"></div><div class="scw-window-input-phone"><div class="scw-window-input-phone-code">+</div><input type="tel" id="scw-input-form-phone" placeholder="Ваш номер" autocomplete="off"></div><div class="scw-button-form-phone" id="scw-input-form-button">Жду звонка</div></form></div></div>';
    div.innerHTML = text;
    body.appendChild(div);

    var url = window.location.href;
    var req = 'action=chat&token=' + encodeURIComponent(document.getElementById(id).getAttribute("data-token")) + '&url=' + encodeURIComponent(url);
    var socket = new WebSocket("wss://suitecall.com:8980/ws?" + req);
    var session_id = getCookie('suitecall_id');
    var suitecall_window =getCookie('suitecall_window');
    var is_new_session;
    var status;

    if (suitecall_window == '1' ) {
        var el = document.getElementById('scw-window-chat');
        el.className += ' active';
    }
    if (suitecall_window == '2' ) {
        var el = document.getElementById('scw-window-phone');
        el.className += ' active';
    }

    socket.onmessage = function (event) {
        console.log(event.data);
        var data = JSON.parse(event.data);
        switch(data.action) {
            case 'message':
                var sender = 'left';
                var text = data.data;
                if (data.sender == '2') {
                    sender = 'right';
                }
                if (data.sender == '3') {
                    text = text;
                }
                add_message(sender, text);
                scrollbottom();

                if (suitecall_window == '1') {
                	set_read_messages();
                } else {
                	add_unreads(data.unreads);
                }
                break;
            case 'open_session':
                session_id = data.data;
                setCookie('suitecall_id', session_id, {path: '/'});
                add_unreads(data.unreads);
                break;
            case 'viewed':
            	add_unreads(data.unreads);
                break;
            case 'status':
            	status = data.data;
            	update_status();
        }

    };

    socket.onopen = function () {
        if (session_id === undefined) {
            var data = JSON.stringify({action: 'new_session'});
            socket.send(data);
        } else {
            var data = JSON.stringify({action: 'open_session', data: session_id});
            socket.send(data);
        }
        if (suitecall_window == '1' ) {
        	set_read_messages();
        }
    };

    function set_read_messages() {
    	var data = JSON.stringify({ action: 'viewed', data: 'all' });
        socket.send(data);
    }

    function add_unreads(unreads) {
		console.log(unreads);
		var div = document.getElementById('scw-logo-unreads');
		if (unreads > 0) {
			div.innerHTML = unreads;
			div.style.display = 'block';
		} else {
			div.innerHTML = '';
			div.style.display = 'none';
		}
	}

    function update_status() {
    	switch (status) {
    		case 0:
    			document.getElementById('scw-logo-status').style.backgroundColor = '#eee';
    			document.getElementById('scw-window-status').style.backgroundColor = '#eee';
    			break;
    		case 1:
    			document.getElementById('scw-logo-status').style.backgroundColor = '#0e0';
    			document.getElementById('scw-window-status').style.backgroundColor = '#0e0';
    			break;
    		case 3:
    			document.getElementById('scw-logo-status').style.backgroundColor = '#00e';
    			document.getElementById('scw-window-status').style.backgroundColor = '#00e';
    			break;
    	}
	}

    function chat_submit() {
        var text = document.getElementById('scw-input-chat').value;
        var data = JSON.stringify({ action: 'message', data: text });
        socket.send(data);
        document.getElementById('scw-input-chat').value = "";
        add_message("right", text);
        scrollbottom();
        return false;
    }

    document.getElementById('scw-input-chat-button').onclick = chat_submit;
    document.getElementById('scw-input-chat-form').onsubmit = chat_submit;

    function add_message(id, text) {
        var div = document.createElement('div');
        div.className = 'scw-window-chat-'+id+'-row';
        var inner = '<div class="scw-window-chat-block scw-window-chat-'+id+'-block">'+text+'</div>';
        div.innerHTML = inner;
        document.getElementById('scw-window-chat-block').appendChild(div);
        var div = document.createElement('div');
        div.className = 'scw-window-chat-hr';
        document.getElementById('scw-window-chat-block').appendChild(div);
    }

    function scrollbottom() {
        var objDiv = document.getElementById("scw-window-chat-block");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    if (!hiddenGreeting) {
        if (suitecall_window != '1' || suitecall_window != '2') {
            setTimeout(function () {
                var el = document.getElementById('scw-hint-greeting');
                el.className = el.className.replace(new RegExp('(?:^|\\s)' + 'hidden' + '(?:\\s|$)'), '');
                el.className += ' show';
            }, 1000);

            setTimeout(function () {
                var el = document.getElementById('scw-hint-greeting');
                el.className = el.className.replace(new RegExp('(?:^|\\s)' + 'show' + '(?:\\s|$)'), '');
            }, 10000);

            var greetingID = setInterval(function () {
                var el = document.getElementById('scw-hint-greeting');
                el.className = el.className.replace(new RegExp('(?:^|\\s)' + 'hidden' + '(?:\\s|$)'), '');
                el.className += ' show';
                setTimeout(function () {
                    var el = document.getElementById('scw-hint-greeting');
                    el.className = el.className.replace(new RegExp('(?:^|\\s)' + 'show' + '(?:\\s|$)'), '');
                }, 10000);
            }, 65000);
        }
    }

    if (document.getElementById('scw-button-chat') != undefined) {
	    document.getElementById('scw-button-chat').onclick = function () {
	    	close_windows();
	        var el = document.getElementById('scw-window-chat');
	        el.className += ' active';
	        set_read_messages();
	        suitecall_window = 1;
	        setCookie('suitecall_window', 1, {path: '/'});
	        clearInterval(greetingID);
	        var el = document.getElementById('scw-hint-greeting');
	        if (el.classList.contains('show')) {
	        	el.className = el.className.replace(new RegExp('(?:^|\\s)' + 'show' + '(?:\\s|$)'), '');
	        	el.className += ' hidden';
	        }
	    }
    }

    if (document.getElementById('scw-button-phone') != undefined) {
	    document.getElementById('scw-button-phone').onclick = function () {
	    	close_windows();
	        var el = document.getElementById('scw-window-phone');
	        el.className += ' active';
	        suitecall_window = 2;
	        setCookie('suitecall_window', 2, {path: '/'});
	        clearInterval(greetingID);
	        var el = document.getElementById('scw-hint-greeting');
	        if (el.classList.contains('show')) {
	        	el.className = el.className.replace(new RegExp('(?:^|\\s)' + 'show' + '(?:\\s|$)'), '');
	        	el.className += ' hidden';
	        }
	    };
    }

    var els = document.getElementsByClassName('scw-button-close');
    for (var i = 0; i < els.length; i++) {
        els[i].onclick = function () {
        	close_windows();
        	suitecall_window = 0;
            setCookie('suitecall_window', 0, {path: '/'});
        };
    }

    function submit_call() {
        var xhr = new XMLHttpRequest();
        var url = window.location.href;
        var req = 'action=call&token=' + encodeURIComponent(document.getElementById("scw-63hsuwee8").getAttribute("data-token")) + '&url=' + encodeURIComponent(url) + '&name=' + encodeURIComponent(document.getElementById('scw-input-form-name').value) + '&value=' + encodeURIComponent(document.getElementById('scw-input-form-phone').value) + '&message=';
        xhr.open("GET", 'https://suitecall.com:8980/api?' + req, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();
        close_windows();
        return false;
    }

    document.getElementById('scw-input-form-button').onclick = submit_call;
    document.getElementById('scw-input-phone-form').onsubmit = submit_call;

    function close_windows() {
        var els = document.getElementsByClassName('scw-window');
        for (var i = 0; i < els.length; i++) {
            els[i].className = els[i].className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?:\\s|$)'), '');
        }
    }

    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }

    function mobileAndTabletcheck () {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      };
})();
