(function(){
	window.onerror = function(msg, url, line){
		alert('Error' + (line ? ' in line ' + line : '') + '\n' + (url || '') + '\n' + msg);
	};

	/*window.onerror = function(msg, url, line){
		var html = '<div class="error"><span class="url">{url}</span><p class="msg">{msg}</p><span class="line">{line}</span></div>';
		html = html.replace('{url}', url || '');
		html = html.replace('{msg}', msg || '');
		html = html.replace('{line}', line || '');

		var container = document.querySelector ? document.querySelector('.jaydata-errorhandler') : document.getElementsByClassName('jaydata-errorhandler')[0];
		if (!container){
			container = document.createElement('DIV');
			container.innerHTML = '';
			container.className = 'jaydata-errorhandler';
			document.body.appendChild(container);
		}
		
		container.innerHTML += html;
	};*/
})();