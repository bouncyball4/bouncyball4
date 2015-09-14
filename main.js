var BB = (function(){
	window.addEventListener('load', function() {
		var scr = document.createElement('script');
		scr.type="text/javascript";
		scr.onload = function() {
			if(BB.onloadpieces) {
				BB.onloadpieces();
			}
			BB.mainloop();
		};
		scr.src="pieces.js";
		document.body.appendChild(scr);
		this.cnvs = document.getElementById('cnvs');
		this.ctx = this.cnvs.getContext('2d');
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
			BBP.loadPiece(j);
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
			this.rAF(this.mainloop);
		},
		rAF: window.requestAnimationFrame || function(f) {setTimeout(f, 33);};
	};
})();
BB.onloadpieces = function() {
	BB.loadLevelObj({
		"pieces": [
			{type: 'woodblock', x: 300, y: 200, w: 20, h: 20}
		]
	});
};
