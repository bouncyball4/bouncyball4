var BB = (function(){
	window.addEventListener('load', function() {
		BB.cnvs = document.getElementById('cnvs');
		BB.ctx = this.cnvs.getContext('2d');
		BB.rAF = window.requestAnimationFrame || function(f){setTimeout(f,17);};
		BB.rAF = BB.rAF.bind(window);
		window.onkeydown = function(e) {
			if((e.keyCode==13 || e.keyCode==32) && BB.state == 1 && !(BB.wasGoing())) {
				e.preventDefault();
				BB.setGoing();
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
		reloadLevel: function() {
			this.openLevelObj(this.lvlObj);
		},
		draw: function() {
			this.ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height);
			if(this.curLvl && (this.state == 1 || this.state == -1)) {
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
			if(this.state == -1) {
				this.ctx.fillStyle="rgba(255, 255, 255, 0.5)";
				this.ctx.fillRect(0, 0, this.cnvs.width, this.cnvs.height);
				this.ctx.fillStyle = "red";
				this.ctx.font = "100px sans-serif";
				this.ctx.textAlign = 'center';
				this.ctx.fillText('TIME\'S UP!', this.cnvs.width/2, this.cnvs.height/3);
				this.ctx.font = "40px sans-serif";
				this.ctx.fillStyle="black";
				this.ctx.fillText('Press "r" to retry', this.cnvs.width/2, this.cnvs.height/2);
			}
		},
		update: function() {
			if(this.curLvl && this.state == 1) {
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					if(o.update) o.update();
				}
				if(this.isGoing()) {
					this.curLvl.time--;
				}
				if(this.wasGoing() && this.curLvl.time==0) {
					this.state = -1;
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
					if(!o.noBounce && o != c && c.getX()+c.getWidth()>=o.getX() && c.getY()+c.getHeight()>=o.getY() && c.getX()<=o.getX()+o.getWidth() && c.getY()<=o.getY()+o.getHeight() && (!n || o.type==n)) {
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
			return (this.wasGoing() && !(this.curLvl && this.curLvl.finished) && this.curLvl.time>0 && this.state==1);
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
		},
		isFinished: function() {
			return (this.curLvl && this.curLvl.finished);
		},
		state: 1,
		openFileChooser: function() {
			document.getElementById('file').click();
		}
	};
})();
BB.onloadpieces = function() {
	BB.openLevelObj({
		"pieces": [
			{type: 'woodblock', x: 100, y: 100, w: 100, h: 20},
			{type: 'finish', x: 500, y: 300},
			{type: 'ball', x: 300, y: 200, w: 50, h: 50}
		],
		"time": 300
	});
};
if(BB.piecesLoaded) BB.onloadpieces();
