var BB = (function(){
	window.addEventListener('load', function() {
		BB.cnvs = document.getElementById('cnvs');
		BB.ctx = this.cnvs.getContext('2d');
		BB.rAF = window.requestAnimationFrame || function(f){setTimeout(f,17);};
		BB.rAF = BB.rAF.bind(window);
		window.onkeydown = function(e) {
			if(e.keyCode==13 || e.keyCode==32) {
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
			this.loadLevelObj(JSON.parse(str));
		},
		openLevelStr: function(str) {
			this.curLvl = this.loadLevelStr(str);
		},
		openLevelObj: function(j) {
			this.curLvl = this.loadLevelObj(j);
		},
		draw: function() {
			if(this.curLvl) {
				this.ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height);
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					o.draw(this.ctx);
				}
			}
		},
		update: function() {
			if(this.curLvl) {
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					if(o.update) o.update();
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
		getCollision: function(c) {
			if(this.curLvl) {
				for(var i = 0; i < this.curLvl.pieces.length; i++) {
					var o = this.curLvl.pieces[i];
					if(o != c && c.getX()+c.getWidth()>=o.getX() && c.getY()+c.getHeight()>=o.getY() && c.getX()<=o.getX()+o.getWidth() && c.getY()<=o.getY()+o.getHeight()) {
						return o;
					}
				}
			}
			return null;
		},
		isGoing: function() {
			return (this.curLvl && this.curLvl.going);
		},
		setGoing: function() {
			if(this.curLvl) {
				this.curLvl.going=true;
			}
		}
	};
})();
BB.onloadpieces = function() {
	BB.openLevelObj({
		"pieces": [
			{type: 'woodblock', x: 100, y: 100, w: 50, h: 50},
			{type: 'ball', x: 300, y: 200, w: 50, h: 50}
		]
	});
};
if(BB.piecesLoaded) BB.onloadpieces();
