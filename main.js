var BB = (function(){
	window.addEventListener('load', function() {
		BB.cnvs = document.getElementById('cnvs');
		BB.ctx = this.cnvs.getContext('2d');
		BB.rAF = window.requestAnimationFrame || function(f){setTimeout(f,17);};
		BB.rAF = BB.rAF.bind(window);
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
		scr.src="pieces.js";
		document.body.appendChild(scr);
	});
	return {
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
			return this.loadLevelObj(JSON.parse(str));
		},
		openLevelStr: function(str) {
			this.openLevelObj(JSON.parse(str));
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
					tr = JSON.parse(this.responseText);
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
					if(o != c && c.getX()+c.getWidth()>=o.getX() && c.getY()+c.getHeight()>=o.getY() && c.getX()<=o.getX()+o.getWidth() && c.getY()<=o.getY()+o.getHeight() && ((!n && !o.noBounce) || o.type==n || (n=='collectible' && o.collectible))) {
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
	BB.openLevelSet('http://colin.reederhome.net/bouncyball/bb4levels');
};
if(BB.piecesLoaded) BB.onloadpieces();
