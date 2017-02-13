// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);
$("#zaiko_shosai").append("<a href = stock-check.html?id=" + id + " style='float:right;'>詳細はこちら</a>");
$("#nyuuko_shosai").append("<a href = stock-in.html?id=" + id + " style='float:right;'>データの登録・詳細はこちら</a>");
$("#shukko_shosai").append("<a href = stock-out.html?id=" + id + " style='float:right;'>データの登録・詳細はこちら</a>");

//商品情報読み込み
var sql = 'SELECT * FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
//適正在庫算出
var just_leadtime_data = row.item.leadtime;
var just_lack_data = row.item.lack;
if(just_lack_data == 0.01){
	var just_lack = 3.62;
}
else if(just_lack_data == 0.1){
	var just_lack = 3.08;
}
else if(just_lack_data == 0.1){
	var just_lack = 3.08;
}
else if(just_lack_data == 0.5){
	var just_lack = 2.58;
}
else if(just_lack_data == 1){
	var just_lack = 2.33;
}
else if(just_lack_data == 2.5){
	var just_lack = 1.96;
}
else if(just_lack_data == 5){
	var just_lack = 1.65;
}
else if(just_lack_data == 10){
	var just_lack = 1.28;
}

//基礎情報入力
var tbody_zaiko_info = $('#tbody-zaiko_info_table_body');
var tr = $('<tr>').appendTo(tbody_zaiko_info);
	tr.append('<td>' + row.item.code + '</td>');
	tr.append('<td>' + numberWithCommas(row.item.price) + ' 円' + '</td>');
	tr.append('<td>' + row.item.leadtime + ' 日' + '</td>');
	tr.append('<td>' + row.item.lack + '% (安全係数:' + just_lack + ')' + '</td>');
	tr.append('<td id="hensa_id"></td>');
	tr.append('<td id="just_stock_id"></td>');

//入庫数読み込み
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

//適正在庫算出ここから
//日付を取得
var time = $.now();
var dateObj = new Date(time);
var this_year = dateObj.getFullYear();
var this_month = dateObj.getMonth() + 1;
this_month = 4;

var next_year = parseInt(this_year) + 1;
var last1_year = parseInt(this_year) - 1;
var last2_year = parseInt(this_year) - 2;
var last3_year = parseInt(this_year) - 3;

// テーブルに年度設定
$('#this_year').append(this_year);
$('#next_year').append(next_year);
$('#last1_year').append(last1_year);
$('#last2_year').append(last2_year);
$('#last3_year').append(last3_year);
$('#ana_title').append(' (' + this_year + '年' + this_month + '月現在)');

// 標準偏差(日付新しい順)
var shukko_data = alasql("SELECT id, stock, purpose, state, deadline, num FROM trans WHERE stock = "
		+ id + " AND purpose = 2 AND state = 6 ORDER BY deadline DESC");

// データ入力
var this_m1 = 0, this_m2 = 0, this_m3 = 0, this_m4 = 0, this_m5 = 0, this_m6 = 0, this_m7 = 0, this_m8 = 0, this_m9 = 0, this_m10 = 0, this_m11 = 0, this_m12 = 0;
var last1_m1 = 0, last1_m2 = 0, last1_m3 = 0, last1_m4 = 0, last1_m5 = 0, last1_m6 = 0, last1_m7 = 0, last1_m8 = 0, last1_m9 = 0, last1_m10 = 0, last1_m11 = 0, last1_m12 = 0;
var last2_m1 = 0, last2_m2 = 0, last2_m3 = 0, last2_m4 = 0, last2_m5 = 0, last2_m6 = 0, last2_m7 = 0, last2_m8 = 0, last2_m9 = 0, last2_m10 = 0, last2_m11 = 0, last2_m12 = 0;
var last3_m1 = 0, last3_m2 = 0, last3_m3 = 0, last3_m4 = 0, last3_m5 = 0, last3_m6 = 0, last3_m7 = 0, last3_m8 = 0, last3_m9 = 0, last3_m10 = 0, last3_m11 = 0, last3_m12 = 0;
var next_m1 = 0, next_m2 = 0, next_m3 = 0, next_m4 = 0, next_m5 = 0, next_m6 = 0, next_m7 = 0, next_m8 = 0, next_m9 = 0, next_m10 = 0, next_m11 = 0, next_m12 = 0;

for (var i = 0; i < shukko_data.length; i++) {
	var row2 = shukko_data[i];
	var row_date = row2.deadline;
	var row_num = row2.num;
	var row_year = parseInt(row_date.slice(0, 4)); // 年
	var row_month = parseInt(row_date.slice(5, 7)); // 月

	if (row_year >= last3_year) { // 3年前より古いデータ域に突入でbreak
		if (row_year == this_year) { // 今年分
			if (row_month == 1) {
				this_m1 = this_m1 + row_num
			} else if (row_month == 2) {
				this_m2 = this_m2 + row_num
			} else if (row_month == 3) {
				this_m3 = this_m3 + row_num
			} else if (row_month == 4) {
				this_m4 = this_m4 + row_num
			} else if (row_month == 5) {
				this_m5 = this_m5 + row_num
			} else if (row_month == 6) {
				this_m6 = this_m6 + row_num
			} else if (row_month == 7) {
				this_m7 = this_m7 + row_num
			} else if (row_month == 8) {
				this_m8 = this_m8 + row_num
			} else if (row_month == 9) {
				this_m9 = this_m9 + row_num
			} else if (row_month == 10) {
				this_m10 = this_m10 + row_num
			} else if (row_month == 11) {
				this_m11 = this_m11 + row_num
			} else if (row_month == 12) {
				this_m12 = this_m12 + row_num
			}
		} else if (row_year == last1_year) { // 1年前
			if (row_month == 1) {
				last1_m1 = last1_m1 + row_num
			} else if (row_month == 2) {
				last1_m2 = last1_m2 + row_num
			} else if (row_month == 3) {
				last1_m3 = last1_m3 + row_num
			} else if (row_month == 4) {
				last1_m4 = last1_m4 + row_num
			} else if (row_month == 5) {
				last1_m5 = last1_m5 + row_num
			} else if (row_month == 6) {
				last1_m6 = last1_m6 + row_num
			} else if (row_month == 7) {
				last1_m7 = last1_m7 + row_num
			} else if (row_month == 8) {
				last1_m8 = last1_m8 + row_num
			} else if (row_month == 9) {
				last1_m9 = last1_m9 + row_num
			} else if (row_month == 10) {
				last1_m10 = last1_m10 + row_num
			} else if (row_month == 11) {
				last1_m11 = last1_m11 + row_num
			} else if (row_month == 12) {
				last1_m12 = last1_m12 + row_num
			}
		} else if (row_year == last2_year) { // 2年前
			if (row_month == 1) {
				last2_m1 = last2_m1 + row_num
			} else if (row_month == 2) {
				last2_m2 = last2_m2 + row_num
			} else if (row_month == 3) {
				last2_m3 = last2_m3 + row_num
			} else if (row_month == 4) {
				last2_m4 = last2_m4 + row_num
			} else if (row_month == 5) {
				last2_m5 = last2_m5 + row_num
			} else if (row_month == 6) {
				last2_m6 = last2_m6 + row_num
			} else if (row_month == 7) {
				last2_m7 = last2_m7 + row_num
			} else if (row_month == 8) {
				last2_m8 = last2_m8 + row_num
			} else if (row_month == 9) {
				last2_m9 = last2_m9 + row_num
			} else if (row_month == 10) {
				last2_m10 = last2_m10 + row_num
			} else if (row_month == 11) {
				last2_m11 = last2_m11 + row_num
			} else if (row_month == 12) {
				last2_m12 = last2_m12 + row_num
			}
		} else if (row_year == last3_year) { // 3年前
			if (row_month == 1) {
				last3_m1 = last3_m1 + row_num
			} else if (row_month == 2) {
				last3_m2 = last3_m2 + row_num
			} else if (row_month == 3) {
				last3_m3 = last3_m3 + row_num
			} else if (row_month == 4) {
				last3_m4 = last3_m4 + row_num
			} else if (row_month == 5) {
				last3_m5 = last3_m5 + row_num
			} else if (row_month == 6) {
				last3_m6 = last3_m6 + row_num
			} else if (row_month == 7) {
				last3_m7 = last3_m7 + row_num
			} else if (row_month == 8) {
				last3_m8 = last3_m8 + row_num
			} else if (row_month == 9) {
				last3_m9 = last3_m9 + row_num
			} else if (row_month == 10) {
				last3_m10 = last3_m10 + row_num
			} else if (row_month == 11) {
				last3_m11 = last3_m11 + row_num
			} else if (row_month == 12) {
				last3_m12 = last3_m12 + row_num
			}
		}
	} else {
		break;
	}
}// for end

var all_data = [];

// 履歴データ挿入(3年前)
for (var i = 1; i <= 12; i++) {
	var the_month = eval("last3_m" + i);
	$('#last3_year_m' + i).replaceWith(
			'<td id="last3_year_m' + i + '">' + the_month + '</td>');
	all_data.push(the_month);
}
// 履歴データ挿入(2年前)
for (var i = 1; i <= 12; i++) {
	var the_month = eval("last2_m" + i);
	$('#last2_year_m' + i).replaceWith(
			'<td id="last2_year_m' + i + '">' + the_month + '</td>');
	all_data.push(the_month);
}
// 履歴データ挿入(1年前)
for (var i = 1; i <= 12; i++) {
	var the_month = eval("last1_m" + i);
	$('#last1_year_m' + i).replaceWith(
			'<td id="last1_year_m' + i + '">' + the_month + '</td>');
	all_data.push(the_month);
}
// 履歴データ挿入(今年)
for (var i = 1; i <= 12; i++) {
	if (i < this_month) { // 先月分まで挿入
		var the_month = eval("this_m" + i);
		$('#this_year_m' + i).replaceWith(
				'<td id="this_year_m' + i + '">' + the_month + '</td>');
		all_data.push(the_month);
	} else {
		break;
	}
}

//標準偏差
var hensa_box = [];
if(this_month == 1){ //1月の場合：10-12月分代入
	hensa_box.push(last1_m10, last1_m11, last1_m12);
}
else if(this_month == 2){ //2月の場合：11-1月分代入
	hensa_box.push(last1_m11, last1_m12, this_m1);
}
else if(this_month == 3){ //3月の場合：1-2月分代入
	hensa_box.push(last1_m12, this_m1, this_m2);
}
else{ //4月以降は直近3ヶ月分
	for(i=1; i<=3; i++){
	var last_month = this_month - i;
	var this_month_num = eval("this_m" + last_month);
	hensa_box.push(this_month_num);
	}
}

//標準偏差：平均
function getAverage(hensa_box){
	var sum = 0;
	var average = -1;
	for(var i=0; i<hensa_box.length; i++){
		sum += hensa_box[i];
	}
	average = sum / hensa_box.length;
	return average;
}

//標準偏差：分散
function getVariance(hensa_box){
	var average = getAverage(hensa_box);
	var variance = -1;
	var sum = 0;
	for (var i=0; i<hensa_box.length; i++){
		sum += Math.pow((hensa_box[i] - average), 2);
	}
	variance = sum / hensa_box.length;
	return variance;
}

//標準偏差(分散のルート)
function getStandardDeviation(hensa_box){
	var variance = getVariance(hensa_box);
	var standardDeviation = Math.sqrt(variance);
	return standardDeviation;
}

var hensa = getStandardDeviation(hensa_box);
var hensa_float = floatFormat2(hensa);
$('#hensa_id').replaceWith('<td id="hensa_id">' + numberWithCommas(hensa_float) + '</td>');

var ave_3month =  (hensa_box[0] + hensa_box[1] + hensa_box[2]) / 3; //直近3ヶ月の平均出庫数
var just_leadtime = Math.sqrt(just_leadtime_data); //リードタイムの平方根
var just_leadtime_float = floatFormat2(just_leadtime); //四捨五入
var just_stock_num = just_lack * hensa_float * just_leadtime_float + ave_3month * 1.5;
var just_stock_num_float = floatFormatZero(just_stock_num); //適正在庫 四捨五入
$('#just_stock_id').replaceWith('<td id="just_stock_id">' + numberWithCommas(just_stock_num_float) + '</td>');
//適正在庫算出ここまで

//在庫数吐き出し
var warehouse_stock = in_13 - in_19 - out_26 + out_27 - out_28; //在庫数(倉庫内在庫)
var mikomi_stock = warehouse_stock + in_12 - out_24 - out_25; //理論在庫
var safe_stock = just_stock_num_float; //安全在庫数
var diff_stock_warehouse = warehouse_stock - safe_stock; //倉庫在庫 - 安全在庫
var diff_stock_mikomi = mikomi_stock - safe_stock; //理論在庫 - 安全在庫
if(safe_stock == 0){
	var percent_stock_warehouse = 0; //倉庫在庫ステータス(%)
	var percent_stock_mikomi = 0; //理論在庫ステータス(%)
}
else{
	var percent_stock_warehouse = warehouse_stock / safe_stock * 100; //倉庫在庫ステータス(%)
	var percent_stock_mikomi = mikomi_stock / safe_stock * 100; //理論在庫ステータス(%)
}

var percent_stock_float_warehouse = floatFormatZero(percent_stock_warehouse); //倉庫在庫ステータス(%)四捨五入
var percent_stock_float_mikomi = floatFormatZero(percent_stock_mikomi); //理論在庫ステータス(%)四捨五入
var tbody_zaiko_state = $('#tbody-zaiko_state');

//1段目(倉庫在庫)
var tr = $('<tr data-toggle="tooltip" data-placement="top" title="倉庫在庫数 = (1) - (2)">').appendTo(tbody_zaiko_state);
	tr.append('<th>倉庫在庫</th>');
	tr.append('<td>' + numberWithCommas(warehouse_stock) + '</td>');
	tr.append('<td>' + numberWithCommas(just_stock_num_float) + '</td>');
	tr.append('<td>' + numberWithCommas(diff_stock_warehouse) + '</td>');
	if (percent_stock_float_warehouse > 150){ //在庫151%～：赤
	tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 100%;">' + percent_stock_float_warehouse + '%</div></div> </td>');
	}
	else if (percent_stock_float_warehouse <= 150 && percent_stock_float_warehouse > 110){ //在庫111～150：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: 100%;">' + percent_stock_float_warehouse + '%</div></div> </td>');
	}
	else if (percent_stock_float_warehouse <= 110 && percent_stock_float_warehouse >= 90){ //在庫90～110：緑
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width: 100%;">' + percent_stock_float_warehouse + '%</div></div> </td>');
	}
	else if (percent_stock_float_warehouse < 90 && percent_stock_float_warehouse >= 50){ //在庫50～89：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: ' + percent_stock_float_warehouse + '%;">' + percent_stock_float_warehouse + '%</div></div> </td>');
	}
	else if (percent_stock_float_warehouse < 50 && percent_stock_float_warehouse >= 10){ //在庫10～49：赤
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: ' + percent_stock_float_warehouse + '%;">' + percent_stock_float_warehouse + '%</div></div> </td>');
	}
	else if (percent_stock_float_warehouse < 10 && percent_stock_float_warehouse >= 0){ //在庫0～10：赤(バーの%を見やすくするため)
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 10%;">' + percent_stock_float_warehouse + '%</div></div> </td>');
	}
	else if (percent_stock_float_warehouse < 0){ //在庫0未満(マイナス)：しましま赤(理論在庫でマイナスになり得る)
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" style="width: 100%;">至急発注</div></div> </td>');
	}
//2段目(理論在庫)
	var tr = $('<tr data-toggle="tooltip" data-placement="bottom" title="理論在庫数 = (1) - (2) + (3) - (4)">').appendTo(tbody_zaiko_state);
	tr.append('<th>理論在庫</th>');
	tr.append('<td>' + numberWithCommas(mikomi_stock) + '</td>');
	tr.append('<td>' + numberWithCommas(just_stock_num_float) + '</td>');
	tr.append('<td>' + numberWithCommas(diff_stock_mikomi) + '</td>');
	if (percent_stock_float_mikomi > 150){ //在庫151%～：赤
	tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 100%;">' + percent_stock_float_mikomi + '%</div></div> </td>');
	}
	else if (percent_stock_float_mikomi <= 150 && percent_stock_float_mikomi > 110){ //在庫111～150：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: 100%;">' + percent_stock_float_mikomi + '%</div></div> </td>');
	}
	else if (percent_stock_float_mikomi <= 110 && percent_stock_float_mikomi >= 90){ //在庫90～110：緑
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width: 100%;">' + percent_stock_float_mikomi + '%</div></div> </td>');
	}
	else if (percent_stock_float_mikomi < 90 && percent_stock_float_mikomi >= 50){ //在庫50～89：黄
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" style="width: ' + percent_stock_float_mikomi + '%;">' + percent_stock_float_mikomi + '%</div></div> </td>');
	}
	else if (percent_stock_float_mikomi < 50 && percent_stock_float_mikomi >= 10){ //在庫10～49：赤
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: ' + percent_stock_float_mikomi + '%;">' + percent_stock_float_mikomi + '%</div></div> </td>');
	}
	else if (percent_stock_float_mikomi < 10 && percent_stock_float_mikomi >= 0){ //在庫0～10：赤(バーの%を見やすくするため)
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" style="width: 10%;">' + percent_stock_float_mikomi + '%</div></div> </td>');
	}
	else if (percent_stock_float_mikomi < 0){ //在庫0未満(マイナス)：しましま赤(理論在庫でマイナスになり得る)
		tr.append('<td> <div class="progress"><div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" style="width: 100%;">至急発注</div></div> </td>');
	}
	
//入庫済み累積
var nyuuko_total_num = in_13 - in_19;
$("#nyuuko_total").append(numberWithCommas(nyuuko_total_num));

//出庫済み累積
var shukko_total_num = out_26 - out_27 + out_28;
$("#shukko_total").append(numberWithCommas(shukko_total_num));

//発注・入庫手配中
var nyuuko_state_total_num = in_12;
$("#nyuuko_state_total").append(numberWithCommas(nyuuko_state_total_num));

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

//季節指数
var season_m1 = 0, season_m2 = 0, season_m3 = 0, season_m4 = 0, season_m5 = 0, season_m6 = 0, season_m7 = 0, season_m8 = 0, season_m9 = 0, season_m10 = 0, season_m11 = 0, season_m12 = 0;
var all_data_ave12 = []; //移動平均
for (var a=0; a < all_data.length - 11; a++){
	var kari_num = 0;
	for (var i=a; i< a + 12; i++){
		kari_num = kari_num + all_data[i];
	}
	kari_num = kari_num / 12;
	all_data_ave12.push(kari_num);
}

//1月
if (all_data_ave12.length >= 26){
	season_m1 = (last2_m1 / all_data_ave12[1] + last1_m1 / all_data_ave12[13] + this_m1 / all_data_ave12[25]) / 3;
}
else {
	season_m1 = (last2_m1 / all_data_ave12[1] + last1_m1 / all_data_ave12[13]) / 2;
}
//2月
if (all_data_ave12.length >= 27){
	season_m2 = (last2_m2 / all_data_ave12[2] + last1_m2 / all_data_ave12[14] + this_m2 / all_data_ave12[26]) / 3;
}
else {
	season_m2 = (last2_m2 / all_data_ave12[2] + last1_m2 / all_data_ave12[14]) / 2;
}
//3月
if (all_data_ave12.length >= 28){
	season_m3 = (last2_m3 / all_data_ave12[3] + last1_m3 / all_data_ave12[15] + this_m3 / all_data_ave12[26]) / 3;
}
else {
	season_m3 = (last2_m3 / all_data_ave12[3] + last1_m3 / all_data_ave12[15]) / 2;
}
//4月
if (all_data_ave12.length >= 29){
	season_m4 = (last2_m4 / all_data_ave12[4] + last1_m4 / all_data_ave12[16] + this_m4 / all_data_ave12[27]) / 3;
}
else {
	season_m4 = (last2_m4 / all_data_ave12[4] + last1_m4 / all_data_ave12[16]) / 2;
}
//5月
if (all_data_ave12.length >= 30){
	season_m5 = (last2_m5 / all_data_ave12[5] + last1_m5 / all_data_ave12[17] + this_m5 / all_data_ave12[28]) / 3;
}
else {
	season_m5 = (last2_m5 / all_data_ave12[5] + last1_m5 / all_data_ave12[17]) / 2;
}
//6月
if (all_data_ave12.length >= 31){
	season_m6 = (last2_m6 / all_data_ave12[6] + last1_m6 / all_data_ave12[18] + this_m6 / all_data_ave12[29]) / 3;
}
else {
	season_m6 = (last2_m6 / all_data_ave12[6] + last1_m6 / all_data_ave12[18]) / 2;
}
//7月
if (all_data_ave12.length >= 32){
	season_m7 = (last2_m7 / all_data_ave12[7] + last1_m7 / all_data_ave12[19] + this_m7 / all_data_ave12[30]) / 3;
}
else {
	season_m7 = (last2_m7 / all_data_ave12[7] + last1_m7 / all_data_ave12[19]) / 2;
}
//8月
if (all_data_ave12.length >= 33){
	season_m8 = (last2_m8 / all_data_ave12[8] + last1_m8 / all_data_ave12[20] + this_m8 / all_data_ave12[31]) / 3;
}
else {
	season_m8 = (last2_m8 / all_data_ave12[8] + last1_m8 / all_data_ave12[20]) / 2;
}
//9月
if (all_data_ave12.length >= 34){
	season_m9 = (last2_m9 / all_data_ave12[9] + last1_m9 / all_data_ave12[21] + this_m9 / all_data_ave12[32]) / 3;
}
else {
	season_m9 = (last2_m9 / all_data_ave12[9] + last1_m9 / all_data_ave12[21]) / 2;
}
//10月
if (all_data_ave12.length >= 35){
	season_m10 = (last2_m10 / all_data_ave12[10] + last1_m10 / all_data_ave12[22] + this_m10 / all_data_ave12[33]) / 3;
}
else {
	season_m10 = (last2_m10 / all_data_ave12[10] + last1_m10 / all_data_ave12[22]) / 2;
}
//11月
if (all_data_ave12.length >= 36){
	season_m11 = (last2_m11 / all_data_ave12[11] + last1_m11 / all_data_ave12[23] + this_m11 / all_data_ave12[34]) / 3;
}
else {
	season_m11 = (last2_m11 / all_data_ave12[11] + last1_m11 / all_data_ave12[23]) / 2;
}
//12月
if (all_data_ave12.length == 37){
	season_m12 = (last3_m12 / all_data_ave12[0] + last2_m12 / all_data_ave12[12] + last1_m12 / all_data_ave12[24] + this_m12 / all_data_ave12[35]) / 4;
}
else {
	season_m12 = (last3_m12 / all_data_ave12[0] + last2_m12 / all_data_ave12[12] + last1_m12 / all_data_ave12[24]) / 3;
}

//季節指数挿入
for (var i = 1; i <= 12; i++) {
	var the_month = floatFormat2(eval("season_m" + i));
	$('#season' + i).replaceWith('<td id="season' + i + '">' + the_month + '</td>');
}

//四捨五入
function floatFormat2(number){ //四捨五入2桁
	var _pow = Math.pow(10, 2);
	return Math.round(number * _pow) / _pow;
}
function floatFormatZero(number){  //四捨五入0桁
	var _pow = Math.pow(10, 0);
	return Math.round(number * _pow) / _pow;
}

//ツールチップ
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});
 
//タブhover
$(function(){
	$("ul.dropdown-menu").hide();
	$("li.dropdown").hover(function(){
		$("ul:not(:animated)",this).slideDown("fast");
	},
	function(){
		$("ul",this).slideUp("fast");
	});
});