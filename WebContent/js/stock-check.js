// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 商品情報読み込み
var sql = 'SELECT * FROM trans \
		JOIN stock ON stock.id = trans.stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		JOIN kind ON kind.id = item.kind \
		WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
var tbody_zaiko_info = $('#tbody-zaiko_info_table_body');
var tr = $('<tr>').appendTo(tbody_zaiko_info);
tr.append('<td>' + row.item.leadtime + ' 日' + '</td>');
tr.append('<td id="lack_data"></td>');
tr.append('<td id="hensa_data"></td>');

// 現在の在庫数
// 入庫数読み込み
var in_13_sql = alasql(
		'SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 3',
		[ id ])[0];
var in_13 = in_13_sql["SUM(num)"]; // 入庫済み
var in_19_sql = alasql(
		'SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 1 AND state = 9',
		[ id ])[0];
var in_19 = in_19_sql["SUM(num)"]; // 棚卸(過剰)数：値はマイナスで保持

// 出庫数読み込み
var out_26_sql = alasql(
		'SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 6',
		[ id ])[0];
var out_26 = out_26_sql["SUM(num)"]; // 出庫済み
var out_27_sql = alasql(
		'SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 7',
		[ id ])[0];
var out_27 = out_27_sql["SUM(num)"]; // 返品数
var out_28_sql = alasql(
		'SELECT SUM(num) FROM trans WHERE stock = ? AND purpose = 2 AND state = 8',
		[ id ])[0];
var out_28 = out_28_sql["SUM(num)"]; // 棚卸(不足)数

// パンくずリスト商品名追加
var bread_rows = alasql(
		'SELECT * FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE stock.id = ?',
		[ id ])[0];
var this_bread_name = "(倉庫) " + bread_rows.whouse.name + "　(品番) "
		+ bread_rows.item.maker + " : " + bread_rows.item.detail;
$('#this_bread').text(this_bread_name);

// 在庫数吐き出し
var warehouse_stock = in_13 - in_19 - out_26 + out_27 - out_28; // 在庫数(倉庫内在庫)

// 日付を取得
var time = $.now();
var dateObj = new Date(time);
var this_year = dateObj.getFullYear();
var this_month = dateObj.getMonth() + 1;

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

// 履歴データ挿入(3年前)：時間あればfor使う
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

// 標準偏差
var hensa_box = [];
if (this_month == 1) { // 1月の場合：10-12月分代入
	hensa_box.push(last1_m10, last1_m11, last1_m12);
} else if (this_month == 2) { // 2月の場合：11-1月分代入
	hensa_box.push(last1_m11, last1_m12, this_m1);
} else if (this_month == 3) { // 3月の場合：1-2月分代入
	hensa_box.push(last1_m12, this_m1, this_m2);
} else { // 4月以降は直近3ヶ月分
	for (i = 1; i <= 3; i++) {
		var last_month = this_month - i;
		var this_month_num = eval("this_m" + last_month);
		hensa_box.push(this_month_num);
	}
}

var hensa_float = 0;
$(function() {
	// 標準偏差：平均
	function getAverage(hensa_box) {
		var sum = 0;
		var average = -1;
		for (var i = 0; i < hensa_box.length; i++) {
			sum += hensa_box[i];
		}
		average = sum / hensa_box.length;
		return average;
	}

	// 標準偏差：分散
	function getVariance(hensa_box) {
		var average = getAverage(hensa_box);
		var variance = -1;
		var sum = 0;
		for (var i = 0; i < hensa_box.length; i++) {
			sum += Math.pow((hensa_box[i] - average), 2);
		}
		variance = sum / hensa_box.length;
		return variance;
	}

	// 標準偏差(分散のルート)
	function getStandardDeviation(hensa_box) {
		var variance = getVariance(hensa_box);
		var standardDeviation = Math.sqrt(variance);
		return standardDeviation;
	}

	var hensa = getStandardDeviation(hensa_box);
	// 四捨五入
	function floatFormat(number) {
		var _pow = Math.pow(10, 2);
		return Math.round(number * _pow) / _pow;
	}
	hensa_float = floatFormat(hensa);
	$("#hensa_data").replaceWith('<td id="hensa_data">' + hensa_float + '</td>');
})

$(function() {// 適正在庫算出
	var just_leadtime_data = row.item.leadtime;
	var just_lack_data = row.item.lack;
	if (just_lack_data == 0.01) {
		var just_lack = 3.62;
	} else if (just_lack_data == 0.1) {
		var just_lack = 3.08;
	} else if (just_lack_data == 0.1) {
		var just_lack = 3.08;
	} else if (just_lack_data == 0.5) {
		var just_lack = 2.58;
	} else if (just_lack_data == 1) {
		var just_lack = 2.33;
	} else if (just_lack_data == 2.5) {
		var just_lack = 1.96;
	} else if (just_lack_data == 5) {
		var just_lack = 1.65;
	} else if (just_lack_data == 10) {
		var just_lack = 1.28;
	}
	$('#lack_data').replaceWith('<td id="lack_data">' + row.item.lack + '% (安全係数:' + just_lack + ')</td>');

	// 四捨五入
	function floatFormat(number) { // 四捨五入2桁
		var _pow = Math.pow(10, 2);
		return Math.round(number * _pow) / _pow;
	}
	function floatFormatZero(number) { // 四捨五入0桁
		var _pow = Math.pow(10, 0);
		return Math.round(number * _pow) / _pow;
	}
	var ave_3month = (hensa_box[0] + hensa_box[1] + hensa_box[2]) / 3; // 直近3ヶ月の平均出庫数
	var just_leadtime = Math.sqrt(just_leadtime_data); // リードタイムの平方根
	var just_leadtime_float = floatFormat(just_leadtime); // 四捨五入
	var just_stock_num = just_lack * hensa_float * just_leadtime_float
			+ ave_3month * 1.5;
	var just_stock_num_float = floatFormatZero(just_stock_num); // 適正在庫 四捨五入
	$("#just_stock_data").append(numberWithCommas(just_stock_num_float));
})

// 季節係数(変更)
var s_this_m1 = 0, s_this_m2 = 0, s_this_m3 = 0, s_this_m4 = 0, s_this_m5 = 0, s_this_m6 = 0, s_this_m7 = 0, s_this_m8 = 0, s_this_m9 = 0, s_this_m10 = 0, s_this_m11 = 0, s_this_m12 = 0;
var s_last1_m1 = 0, s_last1_m2 = 0, s_last1_m3 = 0, s_last1_m4 = 0, s_last1_m5 = 0, s_last1_m6 = 0, s_last1_m7 = 0, s_last1_m8 = 0, s_last1_m9 = 0, s_last1_m10 = 0, s_last1_m11 = 0, s_last1_m12 = 0;
var s_last2_m1 = 0, s_last2_m2 = 0, s_last2_m3 = 0, s_last2_m4 = 0, s_last2_m5 = 0, s_last2_m6 = 0, s_last2_m7 = 0, s_last2_m8 = 0, s_last2_m9 = 0, s_last2_m10 = 0, s_last2_m11 = 0, s_last2_m12 = 0;




var test1 = last3_m1 + last2_m1 + last1_m1;
var test2 = last3_m2 + last2_m2 + last1_m2;
var test3 = last3_m3 + last2_m3 + last1_m3;
var test4 = last3_m4 + last2_m4 + last1_m4;
var test5 = last3_m5 + last2_m5 + last1_m5;
var test6 = last3_m6 + last2_m6 + last1_m6;
var test7 = last3_m7 + last2_m7 + last1_m7;
var test8 = last3_m8 + last2_m8 + last1_m8;
var test9 = last3_m9 + last2_m9 + last1_m9;
var test10 = last3_m10 + last2_m10 + last1_m10;
var test11 = last3_m11 + last2_m11 + last1_m11;
var test12 = last3_m12 + last2_m12 + last1_m12;

var test_total = test1 + test2 + test3 + test4 + test5 + test6 + test7 + test8
		+ test9 + test10 + test11 + test12;
var test_ave = test_total / 12;

function floatFormat(number) { // 四捨五入2桁
	var _pow = Math.pow(10, 2);
	return Math.round(number * _pow) / _pow;
}
var test1_point = floatFormat(test1 / test_total * 10);
var test2_point = floatFormat(test2 / test_total * 10);
var test3_point = floatFormat(test3 / test_total * 10);
var test4_point = floatFormat(test4 / test_total * 10);
var test5_point = floatFormat(test5 / test_total * 10);
var test6_point = floatFormat(test6 / test_total * 10);
var test7_point = floatFormat(test7 / test_total * 10);
var test8_point = floatFormat(test8 / test_total * 10);
var test9_point = floatFormat(test9 / test_total * 10);
var test10_point = floatFormat(test10 / test_total * 10);
var test11_point = floatFormat(test11 / test_total * 10);
var test12_point = floatFormat(test12 / test_total * 10);

$('#season1').replaceWith('<td id="season1">' + test1_point + '</td>');
$('#season2').replaceWith('<td id="season2">' + test2_point + '</td>');
$('#season3').replaceWith('<td id="season3">' + test3_point + '</td>');
$('#season4').replaceWith('<td id="season4">' + test4_point + '</td>');
$('#season5').replaceWith('<td id="season5">' + test5_point + '</td>');
$('#season6').replaceWith('<td id="season6">' + test6_point + '</td>');
$('#season7').replaceWith('<td id="season7">' + test7_point + '</td>');
$('#season8').replaceWith('<td id="season8">' + test8_point + '</td>');
$('#season9').replaceWith('<td id="season9">' + test9_point + '</td>');
$('#season10').replaceWith('<td id="season10">' + test10_point + '</td>');
$('#season11').replaceWith('<td id="season11">' + test11_point + '</td>');
$('#season12').replaceWith('<td id="season12">' + test12_point + '</td>');

var test_ave1 = (last1_m1 + last1_m2 + last1_m3 + last1_m4 + last1_m5
		+ last1_m6 + last1_m7 + last1_m8 + last1_m9 + last1_m10 + last1_m11 + last1_m12) / 12;
function floatFormatZero(number) { // 四捨五入0桁
	var _pow = Math.pow(10, 0);
	return Math.round(number * _pow) / _pow;
}

var next_test1 = floatFormatZero(test_ave1 * test1_point);
var next_test2 = floatFormatZero(test_ave1 * test2_point);
var next_test3 = floatFormatZero(test_ave1 * test3_point);
var next_test4 = floatFormatZero(test_ave1 * test4_point);
var next_test5 = floatFormatZero(test_ave1 * test5_point);
var next_test6 = floatFormatZero(test_ave1 * test6_point);
var next_test7 = floatFormatZero(test_ave1 * test7_point);
var next_test8 = floatFormatZero(test_ave1 * test8_point);
var next_test9 = floatFormatZero(test_ave1 * test9_point);
var next_test10 = floatFormatZero(test_ave1 * test10_point);
var next_test11 = floatFormatZero(test_ave1 * test11_point);
var next_test12 = floatFormatZero(test_ave1 * test12_point);

$('#next_year_m1').replaceWith(
		'<td id="#next_year_m1" style="color:red;">' + next_test1 + '</td>');
$('#this_year_m2').replaceWith(
		'<td id="#this_year_m2" style="color:red;">' + next_test2 + '</td>');
$('#this_year_m3').replaceWith(
		'<td id="#this_year_m3" style="color:red;">' + next_test3 + '</td>');
$('#this_year_m4').replaceWith(
		'<td id="#this_year_m4" style="color:red;">' + next_test4 + '</td>');
$('#this_year_m5').replaceWith(
		'<td id="#this_year_m5" style="color:red;">' + next_test5 + '</td>');
$('#this_year_m6').replaceWith(
		'<td id="#this_year_m6" style="color:red;">' + next_test6 + '</td>');
$('#this_year_m7').replaceWith(
		'<td id="#this_year_m7" style="color:red;">' + next_test7 + '</td>');
$('#this_year_m8').replaceWith(
		'<td id="#this_year_m8" style="color:red;">' + next_test8 + '</td>');
$('#this_year_m9').replaceWith(
		'<td id="#this_year_m9" style="color:red;">' + next_test9 + '</td>');
$('#this_year_m10').replaceWith(
		'<td id="#this_year_m10" style="color:red;">' + next_test10 + '</td>');
$('#this_year_m11').replaceWith(
		'<td id="#this_year_m11" style="color:red;">' + next_test11 + '</td>');
$('#this_year_m12').replaceWith(
		'<td id="#this_year_m12" style="color:red;">' + next_test12 + '</td>');

// タブhover
$(function() {
	$("ul.dropdown-menu").hide();
	$("li.dropdown").hover(function() {
		$("ul:not(:animated)", this).slideDown("fast");
	}, function() {
		$("ul", this).slideUp("fast");
	});
});
