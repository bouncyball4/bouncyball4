var BBE = {
	loadData: function() {
		BBE.curDat = window[BBE.ssf.which.value].parse(BBE.ssf.son.value);
		BBE.updateCanvas();
	},
	updateAllTheThings: function() {
		this.updateCanvas();
		this.saveData();
	},
	updateCanvas: function() {
		var ctx = BBE.ctx;
		var p = BBE.curDat.pieces;
		ctx.clearRect(0,0,600,400);
		for(var i = 0; i < p.length; i++) {
			var c = p[i];
			var t = BBP.loadPiece(c);
			t.draw(ctx);
			if(BBE.selected==i) {
				var gripsz = 10;
				ctx.strokeStyle="red"
				//top left
				ctx.beginPath();
				ctx.moveTo(parseInt(t.getX()), parseInt(t.getY())+gripsz);
				ctx.lineTo(parseInt(t.getX()), parseInt(t.getY()));
				ctx.lineTo(parseInt(t.getX())+gripsz, parseInt(t.getY()));
				ctx.stroke();
				//top right
				ctx.beginPath();
				ctx.moveTo(parseInt(t.getX())+t.getWidth()-gripsz, parseInt(t.getY()));
				ctx.lineTo(parseInt(t.getX())+t.getWidth(), parseInt(t.getY()));
				ctx.lineTo(parseInt(t.getX())+t.getWidth(), parseInt(t.getY())+gripsz);
				ctx.stroke();
				//bottom right
				ctx.beginPath();
				ctx.moveTo(parseInt(t.getX())+t.getWidth(), parseInt(t.getY())+t.getHeight()-gripsz);
				ctx.lineTo(parseInt(t.getX())+t.getWidth(), parseInt(t.getY())+t.getHeight());
				ctx.lineTo(parseInt(t.getX())+t.getWidth()-gripsz, parseInt(t.getY())+t.getHeight());
				ctx.stroke();
				//bottom left
				ctx.beginPath();
				ctx.moveTo(parseInt(t.getX())+gripsz, parseInt(t.getY())+t.getHeight());
				ctx.lineTo(parseInt(t.getX()), parseInt(t.getY())+t.getHeight());
				ctx.lineTo(parseInt(t.getX()), parseInt(t.getY())+t.getHeight()-gripsz);
				ctx.stroke();
			}
		}
	},
	select: function(i) {
		BBE.selected = i;
		BBE.updateCanvas();
		var inf = document.getElementById('info');
		inf.innerHTML="";
		if(i!==undefined) {
			var p = BBE.curDat.pieces[i];
			for(var k in BBP.pieces[p.type].defaults) {
				var d = BBP.pieces[p.type].defaults[k];
				var v = p[k]?p[k]:d;
				var inp = document.createElement('input');
				if(typeof d == "number") {
					inp.type = "number";
				}
				else {
					inp.type = "text";
				}
				inp.value = v;
				inp.dataset.key=k;
				var lbl = document.createElement('label');
				lbl.textContent = k+": ";
				lbl.appendChild(inp);
				inf.appendChild(lbl);
				inf.appendChild(document.createElement('br'));
				inp.onchange = function() {
					var val = this.value;
					if(this.type=="number") {
						val = parseInt(val);
					}
					BBE.curDat.pieces[BBE.selected][this.dataset.key] = val;
					BBE.updateAllTheThings();
				};
			}
			var delBtn = document.createElement('button');
			delBtn.textContent="delete";
			delBtn.onclick = function(e) {
				e.preventDefault();
				BBE.curDat.pieces.splice(BBE.selected, 1);
				BBE.saveData();
				BBE.select();
			};
			inf.appendChild(delBtn);
		}
	},
	saveData: function() {
		var son;
		if(BBE.ssf.which.value=="DSON") {
			son = DSON.dogeify(BBE.curDat);
		}
		else {
			son = JSON.stringify(BBE.curDat);
		}
		BBE.ssf.son.value = son;
	}
};
window.onload = function() {
	BBE.ssf = document.getElementById('ssf');
	BBE.ctx = document.getElementById('cnvs').getContext('2d');
	BBE.ssf.son.onchange = function() {BBE.loadData();};
	BBE.ssf.which.onchange = function() {
		if(BBE.curDat) {
			BBE.saveData();
		}
		else {
			BBE.loadData();
		}
	};
	var nos = document.getElementById('new');
	for(var k in BBP.pieces) {
		var opt = document.createElement('option');
		opt.textContent=k;
		opt.value=k;
		nos.appendChild(opt);
	}
	nos.onchange = function() {
		var typ = this.value;
		this.selectedIndex = 0;
		var row = {};
		var src = BBP.pieces[typ].defaults;
		for(var k in src) row[k] = src[k];
		row.type=typ;
		var id = BBE.curDat.pieces.length;
		BBE.curDat.pieces.push(row);
		BBE.saveData();
		BBE.select(id);
	};
	document.getElementById('cnvs').onclick = function(e) {
		var bbox = this.getBoundingClientRect()
		var x = e.clientX-bbox.left;
		var y = e.clientY-bbox.top;
		var i = 0;
		var len = BBE.curDat.pieces.length;
		for(; i < len; i++) {
			var p = BBE.curDat.pieces[i];
			var t = BBP.loadPiece(p);
			if(x>t.getX()&&x<t.getX()+t.getWidth()&&y>t.getY()&&y<t.getY()+t.getHeight()) {
				break;
			}
		}
		if(i<len) {
			BBE.select(i);
		}
		else {
			BBE.select();
		}
	};
	document.getElementById('play').onclick = function() {
		this.textContent="Test Level";
		console.log("hey!?");
		var win = window.open('/#test', 'test');
		win.postMessage(BBE.curDat, '*');
	};
	BBE.loadData();
};
