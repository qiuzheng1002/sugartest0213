// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);
$("#zaiko_shosai").append("<a href = stock-check.html?id=" + id + " style='float:right;'>データの詳細はこちら</a>");
$("#nyuuko_shosai").append("<a href = stock-in.html?id=" + id + " style='float:right;'>データの登録・詳細はこちら</a>");
$("#shukko_shosai").append("<a href = stock-out.html?id=" + id + " style='float:right;'>データの登録・詳細はこちら</a>");

// 商品情報読み込み
var sql = 'SELECT * FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE stock.id = ?';

var row = alasql(sql, [ id ])[0];
$('#image').attr('src', 'img/' + row.item.id + '.jpg');
$('#code').text(row.item.code);
$('#price').text(numberWithCommas(row.item.price) + ' 円');
$('#leadtime').text(row.item.leadtime + ' 日');
$('#lack').text(row.item.lack + ' %');

//入庫数読み込み
var in_11_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 1', [ id ])[0];
var in_11 = in_11_sql["SUM(num)"]; //未発注
var in_12_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 2', [ id ])[0];
var in_12 = in_12_sql["SUM(num)"]; //発注済
var in_13_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 3', [ id ])[0];
var in_13 = in_13_sql["SUM(num)"]; //入庫済み
var in_19_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 9', [ id ])[0];
var in_19 = in_19_sql["SUM(num)"]; //棚卸(過剰)数：値はマイナスで保持

//出庫数読み込み
var out_24_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 4', [ id ])[0];
var out_24 = out_24_sql["SUM(num)"]; //受注済み
var out_25_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 5', [ id ])[0];
var out_25 = out_25_sql["SUM(num)"]; //納期回答済み
var out_26_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 6', [ id ])[0];
var out_26 = out_26_sql["SUM(num)"]; //出庫済み
var out_27_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 7', [ id ])[0];
var out_27 = out_27_sql["SUM(num)"]; //返品数
var out_28_sql = alasql('SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 8', [ id ])[0];
var out_28 = out_28_sql["SUM(num)"]; //棚卸(不足)数

//在庫数吐き出し
var warehouse_stock = in_13 - in_19 - out_26 + out_27 - out_28; //在庫数(倉庫内在庫)
var mikomi_stock = warehouse_stock + in_11 + in_12 - out_24 - out_25; //理論在庫
var safe_stock = 16000; //安全在庫数
var diff_stock = mikomi_stock - safe_stock; //見込み在庫 - 安全在庫
var percent_stock = mikomi_stock / safe_stock * 100; //ステータス(%)
function floatFormat(number){
	var _pow = Math.pow(10, 0);
	return Math.round(number * _pow) / _pow;
}
var percent_stock_float = floatFormat(percent_stock); //ステータス(%)四捨五入
var tbody_zaiko_state = $('#tbody-zaiko_state');
var tr = $('<tr>').appendTo(tbody_zaiko_state);
	tr.append('<td>' + numberWithCommas(warehouse_stock) + '</td>');
	tr.append('<td>' + numberWithCommas(mikomi_stock) + '</td>');
	tr.append('<td>' + numberWithCommas(safe_stock) + '</td>');
	tr.append('<td>' + numberWithCommas(diff_stock) + '</td>');
	if (percent_stock_float > 130){ //在庫131%～：赤
	tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 100%;">' + percent_stock_float + '%</div></div> </td>');
	}
	else if (percent_stock_float <= 130 && percent_stock_float > 110){ //在庫111～130：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: 100%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float <= 110 && percent_stock_float >= 100){ //在庫100～110：緑
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width: 100%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float < 100 && percent_stock_float >= 50){ //在庫50～99：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: ' + percent_stock_float + '%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float < 50 && percent_stock_float >= 10){ //在庫10～49：赤
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: ' + percent_stock_float + '%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float < 10 && percent_stock_float >= 0){ //在庫0～10：赤(バーの%を見やすくするため)
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 10%;">' + percent_stock_float + '%</div></div> </td>');
		}
	else if (percent_stock_float < 0){ //在庫0未満(マイナス)：しましま赤(理論在庫でマイナスになり得る)
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" style="width: 100%;">至急発注</div></div> </td>');
		}
	
//入庫済み累積
var nyuuko_total_num = in_13 - in_19;
$("#nyuuko_total").append(numberWithCommas(nyuuko_total_num));

//出庫済み累積
var shukko_total_num = out_26 - out_27 + out_28;
$("#shukko_total").append(numberWithCommas(shukko_total_num));

//発注・入庫手配中
var nyuuko_state_total = in_11 + in_12;
var tbody_nyuuko_state = $('#tbody-nyuuko_state');
var tr = $('<tr>').appendTo(tbody_nyuuko_state);
tr.append('<td>' + numberWithCommas(nyuuko_state_total) + '</td>');
tr.append('<td>' + numberWithCommas(in_11) + '</td>');
tr.append('<td>' + numberWithCommas(in_12) + '</td>');

//受注・出庫手配中
var shukko_state_total = out_24 + out_25;
var tbody_shukko_state = $('#tbody-shukko_state');
var tr = $('<tr>').appendTo(tbody_shukko_state);
tr.append('<td>' + numberWithCommas(shukko_state_total) + '</td>');
tr.append('<td>' + numberWithCommas(out_24) + '</td>');
tr.append('<td>' + numberWithCommas(out_25) + '</td>');

//パンくずリスト商品名追加
var bread_rows = alasql(sql, [ id ])[0];
var this_bread_name = "(倉庫) " + bread_rows.whouse.name + "　(品番) " + bread_rows.item.maker + " : " + bread_rows.item.detail;
$('#this_bread').text(this_bread_name);