var StarSON = (function() {
	var dsu = "lib/DSON.js";
	var scr = document.createElement('script');
	scr.src = dsu;
	document.body.appendChild(scr);
	return {
		parse: function(s) {
			if(s.indexOf('such')>-1) {
				try {
					return DSON.parse(s);
				} catch(e) {
					console.log(e);
				}
			}
			return JSON.parse(s);
		}
	};
})();
var KeyButton = function(cd) {
	var elem = document.createElement('span');
	var chr = String.fromCharCode(cd);
	if(cd==37) chr='<';
	if(cd==38) chr='^';
	if(cd==39) chr='>';
	if(cd==40) chr='\\/';
	if(cd==32) chr='space';
	elem.textContent=chr;
	elem.dataset.keyCode=cd;
	elem.className="keyBtn"+(cd==32?' space':'');
	elem.onmousedown = function() {
		window.onkeydown({
			keyCode: this.dataset.keyCode,
			preventDefault: function(){}
		});
	};
	elem.onmouseup = function() {
		window.onkeyup({
			keyCode: this.dataset.keyCode,
			preventDefault: function(){}
		});
	};
	return elem;
};
var BB = (function(){
	window.onkeydown = function(e) {
		if((e.keyCode==13 || e.keyCode==32)) {
			if(BB.state == 1 && !(BB.wasGoing())) {
				e.preventDefault();
				BB.setGoing();
			}
			if(BB.state == 2 && BB.curLvlSet.length>0) {
				e.preventDefault();
				BB.nextLevel();
			}
		}
		if(BB.curLvl) {
			for(var i = 0; i < BB.curLvl.pieces.length; i++) {
				var o = BB.curLvl.pieces[i];
				if(o.onkeydown) {
					o.onkeydown(e);
				}
			}
		}
		if(e.keyCode == 82 && !e.ctrlKey) {
			BB.reloadLevel();
		}
		if(e.keyCode == 79 && e.ctrlKey) {
			BB.openFileChooser();
			e.preventDefault();
		}
		if(e.keyCode == 114) e.preventDefault();
	};
	window.onkeyup = function(e) {
		if(BB.curLvl) {
			for(var i = 0; i < BB.curLvl.pieces.length; i++) {
				var o = BB.curLvl.pieces[i];
				if(o.onkeyup) {
					o.onkeyup(e);
				}
			}
		}
		if(e.keyCode == 114) BB.debug=!BB.debug;
	};
	window.onmessage = function(d) {
		console.log(d);
		BB.openLevelObj(d.data);
	};
	document.getElementById('file').onchange = function(evt) {
		var f = evt.target.files;
		if(f[0]) {
			var read = new FileReader();
			read.onload = function(d) {
				BB.openLevelStr(this.result);
			};
			read.readAsText(f[0]);
		}
	};
	var scr = document.createElement('script');
	scr.type="text/javascript";
	scr.onload = function() {
		if(BB.onloadpieces) {
			BB.onloadpieces();
		}
		BB.piecesLoaded = true;
		BB.mainloop();
	};
	scr.src="pieces.js?v="+Math.random();
	document.body.appendChild(scr);
	if(document.getElementById('h2p')) {
		document.getElementById('up-arrow').appendChild(KeyButton(38));
		document.getElementById('left-arrow').appendChild(KeyButton(37));
		document.getElementById('right-arrow').appendChild(KeyButton(39));
		document.getElementById('down-arrow').appendChild(KeyButton(40));
		document.getElementById('space').appendChild(KeyButton(32));
	}
	return {
		cnvs: document.getElementById('cnvs'),
		ctx: this.cnvs.getContext('2d'),
		rAF: (window.requestAnimationFrame || function(f){setTimeout(f,17);}).bind(window),
		loadLevelObj: function(j) {
			var l = [];
			
			var p = j.pieces;
			for(var i = 0; i < p.length; i++) {
				l.push(this.loadPiece(p[i]));
			}
			var tr = {};
			tr.time = (j.time?j.time:-42);
			tr.pieces = l;
			return tr;
		},
		loadPiece: function(j) {
			return BBP.loadPiece(j);
		},
		loadLevelStr: function(str) {
			return this.loadLevelObj(StarSON.parse(str));
		},
		openLevelStr: function(str) {
			this.openLevelObj(StarSON.parse(str));
		},
		openLevelObj: function(j) {
			this.lvlObj = j;
			this.curLvl = this.loadLevelObj(j);
			this.state = 1;
		},
		noCacheUrl: function(url) {
			return url+((url.indexOf('?')>-1)?'&':'?')+'t='+Math.random();
		},
		loadLevelUrl: function(url, callback, olj) {
			var xhr = new XMLHttpRequest();
			url = this.noCacheUrl(url);
			xhr.open('GET', url);
			xhr.onload = function(d) {
				var tr;
				if(!olj) {
					tr = BB.loadLevelStr(this.responseText);
				}
				else {
					tr = StarSON.parse(this.responseText);
				}
				if(callback) {
					callback(tr);
				}
			};
			xhr.send();
		},
		openLevelUrl: function(url) {
			this.loadLevelUrl(url, function(d) {
				BB.openLevelObj(d);
			}, true);
		},
		openLevelSet: function(url) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', this.noCacheUrl(url+'/info'));
			xhr.onload = function() {
				var lvls = [];
				var l = this.responseText.split("\n");
				for(var i = 0; i < l.length; i++) {
					if(l[i]) lvls.push(url+"/"+l[i]+".bblj");
				}
				BB.curLvlSet = lvls;
				BB.nextLevel();
			};
			xhr.send();
		},
		nextLevel: function() {
			this.openLevelUrl(this.curLvlSet.shift());
		},
		reloadLevel: function() {
			this.openLevelObj(this.lvlObj);
		},
		draw: function() {
			this.ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height);
			if(this.curLvl && (this.state == 1 || this.state == -1 || this.state == 2)) {
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					o.draw(this.ctx);
				}
				if(this.curLvl.time>=0) {
					this.ctx.fillStyle="red";
					this.ctx.font = "16px sans-serif";
					this.ctx.textAlign = "left";
					this.ctx.fillText("Time: "+this.curLvl.time, 0, this.cnvs.height);
				}
				if(this.debug) {
					this.ctx.fillStyle="gray";
					this.ctx.font = "16px sans-serif";
					this.ctx.textAlign = "left";
					this.ctx.fillText(parseInt(this.findBall().getX())+","+parseInt(this.findBall().getY()), 4, 20);
				}
			}
			if(this.state == -1 || this.state == 2) {
				this.ctx.fillStyle="rgba(255, 255, 255, 0.5)";
				this.ctx.fillRect(0, 0, this.cnvs.width, this.cnvs.height);
				this.ctx.textAlign = 'center';
				this.ctx.font = "40px sans-serif";
				this.ctx.fillStyle="black";
				this.ctx.fillText('Press "r" to retry', this.cnvs.width/2, this.cnvs.height/2);
			}
			if(this.state == -1) {
				this.ctx.fillStyle = "red";
				this.ctx.font = "100px sans-serif";
				this.ctx.fillText('TIME\'S UP!', this.cnvs.width/2, this.cnvs.height/3);
			}
			if(this.state == 2) {
				this.ctx.fillStyle = "lime";
				this.ctx.font = "80px sans-serif";
				this.ctx.textAlign = 'center';
				this.ctx.fillText('Level Complete!', this.cnvs.width/2, this.cnvs.height/3);
				if(this.curLvlSet.length>0) {
					this.ctx.font = "40px sans-serif";
					this.ctx.fillStyle = "black";
					this.ctx.fillText('Press space to continue', this.cnvs.width/2, this.cnvs.height/2+60);
				}
			}
		},
		findBall: function() {
			if(this.curLvl) {
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					if(o.type=="ball") {
						return o;
					}
				}
			}
			return new BBP.pieces.ball({x:0,y:0});
		},
		debug:false,
		update: function() {
			if(this.curLvl) {
				while(this.toRemove.length>0) {
					var rm = this.toRemove.shift();
					var ind = this.curLvl.pieces.indexOf(rm);
					if(ind>-1) {
						this.curLvl.pieces.splice(ind, 1);
					}
				}
				if(this.state == 1) {
					for(var i = 0; i < this.curLvl.pieces.length; i++) {
						var o = this.curLvl.pieces[i];
						if(o.update) o.update();
					}
					if(this.isGoing() && this.curLvl.time != -42) {
						this.curLvl.time--;
					}
					if(this.wasGoing() && this.curLvl.time==0) {
						this.state = -1;
					}
				}
			}
		},
		mainloop: function() {
			if(this.curLvl) {
				this.update();
				this.draw();
			}
			this.rAF(this.mainloop.bind(this));
		},
		getCollision: function(c, n) {
			if(this.curLvl) {
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					if(o != c && c.getX()+c.getWidth()>=o.getX() && c.getY()+c.getHeight()>=o.getY() && c.getX()<=o.getX()+o.getWidth() && c.getY()<=o.getY()+o.getHeight() && ((!n && !(o.noBounce && (((typeof o.noBounce)!='function')||o.noBounce(c)))) || o.type==n || (n=='collectible' && o.collectible) || (n=='moving'&&(o.xv||o.yv)))) {
						return o;
					}
				}
			}
			return null;
		},
		wasGoing: function() {
			return (this.curLvl && this.curLvl.going);
		},
		isGoing: function() {
			return (this.wasGoing() && !(this.curLvl && this.curLvl.finished) && (this.curLvl.time>0 || this.curLvl.time==-42) && this.state==1);
		},
		setGoing: function() {
			if(this.curLvl) {
				this.curLvl.going=true;
			}
		},
		setFinished: function() {
			if(this.curLvl) {
				this.curLvl.finished=true;
			}
			this.state = 2;
		},
		isFinished: function() {
			return (this.curLvl && this.curLvl.finished);
		},
		state: 1,
		openFileChooser: function() {
			document.getElementById('file').click();
		},
		isPresent: function(o) {
			return (this.curLvl && this.curLvl.pieces.indexOf(o)>-1);
		},
		removePiece: function(o) {
			BB.toRemove.push(o);
		},
		toRemove: [],
		curLvlSet: []
	};
})();
BB.onloadpieces = function() {
	if(location.hash!="#test") {
		BB.openLevelSet('http://colin.reederhome.net/bouncyball/bb4levels');
	}
};
if(BB.piecesLoaded) BB.onloadpieces();
