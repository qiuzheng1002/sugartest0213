var DB = {};

DB.init = function() {
	if (window.confirm('DBが初期化されます。よろしいですか？')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// 分類
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// アイテム
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, leadtime INT, lack INT, safestock INT);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?,?,?);', item);
		}
	});

	// 倉庫
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?);', whouse);
				}
			});

	// 在庫
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, wh_stock INT, mi_shukko INT, mi_nyuuko INT);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				stocks.sort(function(x,y){ //item順に並べ替え
					if (x[1] < y[1]){
						return -1;
					}
					if (x[1] > y[1]){
						return 1;
					}
					return 0;
				})
				stocks.sort(function(x,y){ //whouse順に並べ替え
					if (x[2] < y[2]){
						return -1;
					}
					if (x[2] > y[2]){
						return 1;
					}
					return 0;
				})
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?,?,?);', stock);
				}
			});
	
	// トランザクション
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, purpose INT, state INT, date DATE, deadline DATE, num INT, shop STRING);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?);', trans);
				}
			});

	// リロード
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans]).then(function() {
		window.location.reload(true);
	});
};

DB.remove = function() {
	if (window.confirm('DBが削除されます。よろしいですか？')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// 桁区切り
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// データベース接続
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	// MUST ADD LINE WHEN CREATING NEW TABLE!
	alasql.options.joinstar = 'json';
	alasql('SELECT * FROM kind WHERE id = 1;');
	alasql('SELECT * FROM item WHERE id = 1;');
	alasql('SELECT * FROM whouse WHERE id = 1;');
	alasql('SELECT * FROM stock WHERE id = 1;');
	alasql('SELECT * FROM trans WHERE id = 1;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
